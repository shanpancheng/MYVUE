/**
 * 定义Vue类， 用于创建vue实例
 */
class Vue {
  constructor(options = {}) {
    this.$el = options.el;
    this.$data = options.data;
    this.$methods = options.methods;

    // 监视data中的数据
    new Observer(this.$data);

    // 将数据和方法挂载到vm上
    this.proxy(this.$data);
    this.proxy(this.$methods);

    // 如果指定了el 节点， 对el进行解析
    if(this.$el) {
      // complier 负责解析模板的内容
      new Compiler(this.$el, this);
    }
  }

  // 将数据和方法挂载到vm上
  proxy(obj) {
    Object.keys(obj).forEach(key => {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return obj[key];
        },
        set(newValue) {
          if(obj[key] === newValue) return;
          obj[key] = newValue;
        }
      })

    })
  }
}