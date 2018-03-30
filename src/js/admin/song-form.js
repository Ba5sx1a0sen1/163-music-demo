{
    let view = {
        el: $('.page > main'),
        template: `
        <form>
            <div class="row">
                <label>
                    歌名
                </label>
                <input name="name" type="text" value="__name__">
            </div>
            <div class="row">
                <label>
                    歌手
                </label>
                <input name="singer" type="text" value="__singer__">                
            </div>
            <div class="row">
                <label>
                    外链
                </label>
                <input name="url" type="text" value="__url__">                
            </div>
            <div class="row">
                <label>
                    封面
                </label>
                <input name="cover" type="text" value="__cover__">                
            </div>
            <div class="row">
                <label>
                    <button type='submit'>保存</button>
                </label>
            </div>
        </form>
        `,
        render(data = {}) {
            let placeholders = ['name', 'singer', 'url','cover','id']
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || ``)
            })
            $(this.el).html(html)
            if (data.id) {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset() {
            this.render({})
        }
    }
    let model = {
        data: { name: '', singer: '', url: '', id: '',cover:'' },
        create(data) {
            var Song = AV.Object.extend('Song');
            var song = new Song();
            song.set('name', data.name);
            song.set('singer', data.singer);
            song.set('url', data.url);
            song.set('cover', data.cover);            
            return song.save().then((newSong) => {
                let { id, attributes } = newSong
                // Object.assign(this.data,{id,...attributes}) 使用到了旧的内存，要结合深拷贝来做
                this.data = { id, ...attributes }
                console.log(newSong);
            }, (error) => {
                console.error(error);
            });
        },
        update(data){
            var song = AV.Object.createWithoutData('Song', this.data.id);
            song.set('name', data.name);
            song.set('singer',data.singer)
            song.set('url',data.url)
            song.set('cover',data.cover)            
            return song.save().then((Response)=>{
                Object.assign(this.data,data)
                return Response
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view //this是Controller
            this.model = model
            this.view.render(this.model.data) //this是this.view 调用得到前面定义的函数
            this.bindEvents()
            window.eventHub.on('select', (data) => {
                this.model.data = data
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', (data) => {
                if (this.model.data.id) {
                    this.model.data = {
                        name: '', url: '', id: '', singer: ''
                    }
                } else {
                    Object.assign(this.model.data, data) //留下自定义bug
                }
                this.view.render(this.model.data)
            })
        },
        reset(data) {
            this.view.render(data)
        },
        create() {
            let need = ['name', 'singer', 'url','cover']
            let data = {}
            need.map((string) => {
                data[string] = $(this.view.el).find(`[name=${string}]`).val()
            })
            this.model.create(data)
                .then(() => {
                    this.view.reset()
                    window.eventHub.emit('create', this.model.data)
                })
        },
        update(){
            let need = ['name', 'singer', 'url','cover']
            let data = {}
            need.map((string) => {
                data[string] = $(this.view.el).find(`[name=${string}]`).val()
            })
            this.model.update(data)
                .then(()=>{
                    alert('更新成功')
                    window.eventHub.emit('update',JSON.parse(JSON.stringify(this.model.data)))
                })
        },
        bindEvents() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault()
                if (this.model.data.id) {
                    this.update()
                } else {
                    this.create()
                }
            })
        }
    }
    controller.init(view, model)
}