import { Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import * as Queue from 'bull';

import { env } from 'src/processors/config/config.service';
import { Settings } from 'http2';

const redisConfig = {
  ...env.redis,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};
const client = new Redis(redisConfig);
const subscriber = new Redis(redisConfig);

const opts = {
  createClient: function (type) {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(redisConfig);
    }
  },
};

type JobObject = {
  job: Queue.Job<any>;
  _finished: { resolve; reject };
  finished: () => Promise<{ value: any }>;
};
const QueueMap: {
  [key: string]: {
    key: Settings;
    queue: Queue.Queue;
    jobs: { [key in Queue.JobId]: JobObject };
    addJob: (jobData) => Promise<JobObject>;
  };
} = {};
@Injectable()
export class TestService {
  async publisherQueue(key, data?) {
    let n = `redpackage-${key}`;
    let q = QueueMap[key];
    // 消费者-列表为空时清除队列
    if (!data) {
      let len = await client.llen(n);
      if (len === 0) {
        if (q) {
          this.destroyQueue(q.queue);
          QueueMap[key] = null;
        }
        return;
      }
    }
    if (!q) {
      q = QueueMap[key] = {
        key,
        queue: new Queue(n, opts),
        jobs: {},
        addJob: async (jobData) => {
          let job = await q.queue.add(jobData);
          let _finished: any = {};
          let promise = new Promise<any>((resolve, reject) => {
            _finished.resolve = resolve;
            _finished.reject = reject;
          });
          let jobObj = {
            job,
            _finished,
            finished: () => {
              return promise;
            },
          };
          q.jobs[job.id] = jobObj;
          return jobObj;
        },
      };
      q.queue.setMaxListeners(1000);
      q.queue.process(async (job) => {
        if (job.data?.error) throw new Error('error test');
        let d = await client.lpop(n);
        return { value: d };
      });
      q.queue.on('completed', (job, result) => {
        q.jobs[job.id]?._finished.resolve(result);
      });
      q.queue.on('failed', (job, error) => {
        q.jobs[job.id]?._finished.reject(error);
      });
      if (data) {
        await client.lpush(n, ...data);
      }
    }
    return q;
  }

  private async destroyQueue(queue: Queue.Queue) {
    await queue.obliterate();
    await queue.close();
  }

  async subscriberQueue(key, data) {
    let q = await this.publisherQueue(key);
    let rs: { value: any };
    if (q) {
      let jobObj = await q.addJob(data);
      rs = await jobObj.finished();
    }

    return {
      value: 0,
      ...rs,
    };
  }
}
