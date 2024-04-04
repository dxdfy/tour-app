import Taro from '@tarojs/taro';

export default class Paging {
    constructor(req, page = 0, count = 8) {
        this.page = page;
        this.count = count;
        this.req = req;
        this.url = req.url;
        this.moreData = true;
        this.accumulator = [];
        this.locker = false;
    }

    getCurrentReq() {
        let url = this.url;
        //设置请求参数
        const params = `page=${this.page}&count=${this.count}`;
        //判断拼接方式
        if (url.includes('?')) {
            url += '&' + params;
        } else {
            url += '?' + params;
        }
        this.req.url = url;
        return this.req;
    }

    async actualGetData() {
        const req = this.getCurrentReq();    //获取到具体的请求内容
        const storedToken = wx.getStorageSync('token');
        // console.log(req.url);
        try {
            const response = await Taro.request({
                url: req.url, // 替换为你的接口地址
                method: 'GET',
                header: {
                    'Authorization': storedToken
                }
            });

            // console.log(response);
            if (response.data.status === 0) {
                // console.log(2);
                let paging = response.data.data; //调用自定义工具中的请求方法，进行数据的获取
                // console.log(paging);

                if (!paging) {
                    console.log('未能获取数据');
                }

                if (paging.length === 0) {
                    this.moreData = false;
                }

                //如果存在下页数据，将page+1，便于下次的获取
                if (this.moreData) {
                    this.page += 1;
                }
                // console.log('现在的页码是', this.page)
                //因瀑布流显示数据需要累加展示，所以数据列表也需要累加
                this.accumulator = this.accumulator.concat(paging);
            } else {
                // 请求失败，处理错误
                console.error('获取数据失败：', response.data.message);
            }
        } catch (error) {
            // 请求失败，处理错误
            console.error('请求失败：', error);
        }
    }

    async getMoreData() {
        //1、判断是否存在下一页数据
        if (!this.moreData) {
            return;
        }
        //2、获取锁，判断锁是否为释放状态
        if (this.locker) {
            return;
        }
        this.locker = true;
        //3、请求数据
        await this.actualGetData();
        //4、释放锁
        this.locker = false;
        // console.log(3);
        // console.log(this.accumulator);
        // console.log(4);
        return this.accumulator;
    }
}
