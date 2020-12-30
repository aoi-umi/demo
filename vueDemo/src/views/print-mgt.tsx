import { Component, Vue, Watch } from 'vue-property-decorator'
import * as iview from 'iview'

import { Prop } from '@/components/property-decorator'

import { testApi } from '@/api'
import { convert } from '@/helpers'
import { convClass, getCompOpts } from '@/components/utils'
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button } from '@/components/iview'
import { MyList, IMyList, Const as MyListConst, OnSortChangeOptions, MyListModel } from '@/components/my-list'
import { MyTagModel, MyTag } from '@/components/my-tag'
import { MyConfirm } from '@/components/my-confirm'
import { Base } from './base'

type DetailDataType = {
  _id?: string;
  name?: string;
};

@Component
export default class Bookmark extends Base {
  detailShow = false;
  detail: any;
  $refs: { list: IMyList<any> };

  mounted () {
    this.query()
  }

  @Watch('$route')
  route (to, from) {
    this.query()
  }

  query () {
    const list = this.$refs.list
    const query = this.$route.query
    list.setQueryByKey(query, ['name'])
    convert.Test.queryToListModel(query, list.model)
    this.$refs.list.query(query)
  }

  protected render () {
    return (
      <div>
        <MyList
          ref='list'
          queryArgs={{
            name: {
              label: '名字'
            }
          }}
          columns={[{
            key: '_selection',
            type: 'selection',
            width: 60,
            align: 'center'
          }, {
            title: '名字',
            key: 'name',
            sortable: 'custom',
            minWidth: 120
          }, {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (h, params) => {
              return (
                <div class={MyListConst.clsActBox}>
                  <a on-click={() => {
                    this.detail = params.row
                    this.detailShow = true
                  }}>编辑</a>
                  {/* <a on-click={() => {
                    this.delHandler([params.row._id])
                  }}>删除</a> */}
                </div>
              )
            }
          }]}

          queryFn={async (data) => {
            const rs = await testApi.printMgtQuery(data)
            return rs
          }}

          on-query={(model: MyListModel) => {
            this.$router.push({
              path: this.$route.path,
              query: {
                ...model.query,
                ...convert.Test.listModelToQuery(model)
              }
            })
          }}

          on-add-click={() => {
            this.detail = null
            this.detailShow = true
          }}

        // multiOperateBtnList={[{
        //   text: '批量删除',
        //   onClick: (selection) => {
        //     this.delHandler(selection.map(ele => ele._id))
        //   }
        // }]}
        ></MyList>
      </div>
    )
  }
}
