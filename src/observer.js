
/**
 * 观察，用于给data中所有的数据添加getter setter
 * 
 */

class Observer {
  constructor(data) {
    this.data = data;

    this.walk(this.data);
  }

  // 遍历data中所有数据 添加上getter 和 setter
  walk(data) {
    if(!data || typeof data !== 'object') return;

    Object.keys(data).forEach(key => {
      // 给data中所有数据设置getter setter
      this.defineReactive(data, key, data[key]);
      this.walk(data[key]);
    })
  }

  // 定义响应式的数据，数据劫持
  // 为每个key 添加 watcher
  defineReactive(obj, key, value) {
    const that = this;
    // dep 保存了所有订阅了该数据的订阅者 （watcher 实例）
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        Dep.target && dep.addSub(Dep.target);
        console.log("执行了 getter: ", value);
        return value;
      },
      set(newValue) {
        if(value === newValue) return;
        console.log("执行了 setter: ", newValue);
        value = newValue;
        that.walk(newValue);
        // window.watcher.update();
        dep.notify();
      }
    })
  }
}
