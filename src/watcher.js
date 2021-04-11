
// 将compiler 和 observer 关联起来 动态更新页面内容
class Watcher {
  // vm: vue 实例对象 expr: data中数据的名字 cb: 一旦数据发生了变化，调用cb
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 
    Dep.target = this;
    // 存储expr的旧值
    this.oldValue = this.getValue(this.vm.$data, this.expr);

    Dep.target = null;
  }

  // 对外暴露的方法，用于更新页面
  update() {
    // 对比数据是否发生了变化，如果发生了变化，调用cb
    let oldValue = this.oldValue;
    let newValue = this.getValue(this.vm.$data, this.expr);
    if(oldValue !== newValue) {
      this.cb(newValue, oldValue);
    }
  }

  getValue(data, expr) {
    let exprArr = expr.split('.');
    if(exprArr.length) {
      return exprArr.reduce((initValue, currValue) => {
        return initValue[currValue];
      }, data);
    } else {
      return undefined;
    }
  }

}


// 发布 订阅  通知所有订阅者数据发生了变化 需要更新视图
class Dep {
  constructor() {
    this.subs = [];
  }

  // 添加watcher 
  addSub(watcher) {
    this.subs.push(watcher);
  }

  // 通知所有订阅者数据发生了变化，更新数据
  notify() {
    console.log('this.subs' , this.subs)
    this.subs.forEach(watcher => {
      watcher.update();
    })
  }
}