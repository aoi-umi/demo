import { Injectable } from '@nestjs/common';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class UtilsService {
  private reqQueryParser = RequestQueryParser.create();
  queryToOrmOptions(data) {
    let options: FindManyOptions = {};

    let query = this.reqQueryParser.parseQuery(data).getParsed();
    options.where = query.search;
    if (query.fields?.length) options.select = query.fields;
    if (query.sort) {
      options.order = {};
      query.sort.forEach((ele) => {
        options.order[ele.field] = ele.order;
      });
    }
    options.take = query.limit;
    let skip: number;
    if (query.offset) skip = query.offset;
    else if (query.page && query.limit) {
      skip = (query.page - 1) * query.limit;
    }
    options.skip = skip;

    // console.log(query);
    // console.log(options);
    return options;
  }
}
