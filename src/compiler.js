class Compiler {
  /**
   * 
   * @param {*} el 选择器
   * @param {*} vm Vue 实例
   */
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.vm = vm;
    // 编译模板
    if(this.el) {
      // 1、把el中所有子节点都放入到内存中 fragment
      let fragment = this.node2fragment(this.el);
      // 2、在内存中编译fragment
      this.compile(fragment);

      // 3、把fragment 一次性的添加到页面
      this.el.appendChild(fragment);
    }
  }

  /* 核心方法 */
  // 节点转换成文档碎片
  node2fragment(node) {
    let fragment = document.createDocumentFragment(node);
    // 把el中所有的子节点添加到文档碎片中
    
    let childNode = node.childNodes;
    this.toArray(childNode).forEach(node => {
      fragment.appendChild(node);
    })
    
    return fragment;
  }

  /**
   * 编译文档碎片（内存中）
   * @param {*} fragment 
   */
  compile(fragment) {
    let chilNodes = fragment.childNodes;
    this.toArray(chilNodes).forEach(node => {
      // 编译子节点
      if(this.isElementNode(node)) {
        // 如果是元素节点，需要解析指令
        this.compileElement(node);
      } else if(this.isTextNode(node)) {
        // 如果是文本节点，需要解析插值表达式
        this.compileText(node);
      }

      if(node.childNodes && node.childNodes.length) {
        this.compile(node);
      }

    })
  }

  compileElement(node) {
    // 解析元素节点
    // console.log("解析元素节点");
    this.toArray(node.attributes).forEach(attr => {
      const attrName = attr.name;
      if(this.isDirective(attrName)) {
        let type = attrName.slice(2);
        let expr = attr.value;

        //#region 
        // // 解析v-text
        // if(type === 'text') {
        //   CompileUtil['text'](node, this.vm, expr);
        //   // node.textContent = this.getValue(this.vm.$data, expr);
        // }

        // // 解析v-html
        // if(type === 'html') {
        //   node.innerHTML = this.getValue(this.vm.$data, expr);
        // }

        // // 解析v-model
        // if(type === 'model') {
        //   node.value = this.getValue(this.vm.$data, expr);
        // }
        //#endregion

        // 解析v-on
        if(this.isEventDirective(type)) {
          // 给当前元素注册事件
          CompileUtil['eventHandler'](node, this.vm, type, expr);
        } else {
          CompileUtil[type](node, this.vm, expr);
        }
      }
    })
  }

  compileText(node) {
    // 解析文本节点
    const reg = /\{\{(.+)\}\}/;
    if(reg.test(node.textContent)) {
      const expr = RegExp.$1.trim();
      const txt = node.textContent;
      node.textContent = txt.replace(reg, CompileUtil.getValue(this.vm.$data, expr));
      new Watcher(this.vm, expr, newValue => {
        console.log('node.textContent', txt)
        node.textContent = txt.replace(reg, newValue);
      });
    }
  }


  /* 工具类方法 */
  toArray(likeArray) {
    return [].slice.call(likeArray);
  }

  isElementNode(node) {
    // nodeType 1 元素节点 3 文本节点
    return node.nodeType === 1;
  }

  isTextNode(node) {
    return node.nodeType === 3;
  }

  isDirective(attrName) {
    // 判断是否是指令 
    return attrName.startsWith('v-');
  }

  isEventDirective(type) {
    // 判断是否是事件指令
    return type.split(':')[0] === 'on';
  }
}

let CompileUtil = {
  getValue(data, expr) {
    let exprArr = expr.split('.');
    if(exprArr.length) {
      return exprArr.reduce((initValue, currValue) => {
        return initValue[currValue];
      }, data);
    } else {
      return undefined;
    }
  },
  setValue(data, expr, value) {
    let exprArr = expr.split('.');
    if(!exprArr.length) return;
    exprArr.forEach((key, index) => {
      if(index === exprArr.length - 1) {
        data[key] = value;
      } else {
        data = data[key];
      }
    })
    console.log('data', data)
  },
  text(node, vm, expr) {
    node.textContent = this.getValue(vm.$data, expr);
    new Watcher(vm, expr, newValue => {
      node.textContent = newValue;
    });
  },
  html(node, vm, expr) {
    node.innerHTML = this.getValue(vm.$data, expr);
    new Watcher(vm, expr, newValue => {
      node.innerHTML = newValue;
    });
  },
  model(node, vm, expr) {
    node.value = this.getValue(vm.$data, expr);
    node.addEventListener('input', () => {
      this.setValue(vm.$data, expr, node.value);
    })
    new Watcher(vm, expr, newValue => {
      node.value = newValue;
    });
  },
  eventHandler(node, vm, type, expr) {
    const eventName = type.split(":")[1];
    const eventFn = vm.$methods && vm.$methods[expr];
    if(!eventName || !eventFn) return;
    node.addEventListener(eventName, eventFn.bind(vm));
  }
}