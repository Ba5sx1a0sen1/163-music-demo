window.eventHub = {
    events: {
        '羊城晚报': [],
        'xx都市报': [],
    },//hash 创建多个桶
    emit(eventName,data) { //发布
        console.log('事件发布')
        for(let key in this.events){
            if(key === eventName){
                let callbackList = this.events[key]
                callbackList.map((fn)=>{
                    fn.call(undefined,data)
                })
            }
        }
    },
    on(eventName, callback) { //订阅
        if(this.events[eventName] === undefined){
            this.events[eventName] = []
        }
        for (let key in this.events) {
            if (key === eventName) {
                this.events[key].push(callback)
            }
        }
    },
    off(eventName, callback) {

    },
}