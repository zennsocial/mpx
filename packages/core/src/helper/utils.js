import {
  isObservableArray
} from 'mobx'

export function type (n) {
  return Object.prototype.toString.call(n).slice(8, -1)
}

export function normalizeMap (arr) {
  if (type(arr) === 'Array') {
    const map = {}
    arr.forEach(value => {
      map[value] = value
    })
    return map
  }
  return arr
}

export function isExistAttr (obj, attr) {
  const type = typeof obj
  const isNullOrUndefined = obj === null || obj === undefined
  if (isNullOrUndefined) {
    return false
  } else if (type === 'object' || type === 'function') {
    return attr in obj
  } else {
    return obj[attr] !== undefined
  }
}

export function getByPath (data, pathStr, notExistOutput) {
  if (!pathStr) return data
  const path = pathStr.split('.')
  let notExist = false
  let value = data
  for (let key of path) {
    if (isExistAttr(value, key)) {
      value = value[key]
    } else {
      value = undefined
      notExist = true
      break
    }
  }
  if (notExistOutput) {
    return notExist ? notExistOutput : value
  } else {
    // 小程序setData时不允许undefined数据
    return value === undefined ? '' : value
  }
}

export function enumerable (target, keys) {
  keys.forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(target, key)
    if (!descriptor.enumerable) {
      descriptor.enumerable = true
      Object.defineProperty(target, key, descriptor)
    }
  })
  return target
}

export function proxy (target, source, keys, mapKeys, readonly) {
  if (typeof mapKeys === 'boolean') {
    readonly = mapKeys
    mapKeys = null
  }
  keys.forEach((key, index) => {
    const descriptor = {
      get () {
        return source[key]
      },
      configurable: true,
      enumerable: true
    }
    !readonly && (descriptor.set = function (val) {
      source[key] = val
    })
    Object.defineProperty(target, mapKeys ? mapKeys[index] : key, descriptor)
  })
  return target
}

export function deleteProperties (source, props = []) {
  if (!props.length) return source
  const sourceKeys = Object.keys(source)
  const newData = {}
  for (let key of sourceKeys) {
    if (props.indexOf(key) < 0) {
      newData[key] = source[key]
    }
  }
  return newData
}

export function merge (to, from) {
  if (!from) return to
  let key, toVal, fromVal
  let keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    if (type(toVal) === 'Object' && type(fromVal) === 'Object') {
      merge(toVal, fromVal)
    } else {
      to[key] = fromVal
    }
  }
  return to
}

export function enumerableKeys (obj) {
  const keys = []
  for (let key in obj) {
    keys.push(key)
  }
  return keys
}

export function extend (target, ...froms) {
  for (const from of froms) {
    if (type(from) === 'Object') {
      // for in 能遍历原型链上的属性
      for (const key in from) {
        target[key] = from[key]
      }
    }
  }
  return target
}

export function dissolveAttrs (target = {}, keys) {
  if (type(keys) === 'String') {
    keys = [keys]
  }
  const newOptions = extend({}, target)
  keys.forEach(key => {
    const value = target[key]
    if (type(value) !== 'Object') return
    delete newOptions[key]
    extend(newOptions, value)
  })
  return newOptions
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

export function likeArray (arr) {
  return Array.isArray(arr) || isObservableArray(arr)
}

export function isDef (v) {
  return v !== undefined && v !== null
}

export function stringifyClass (value) {
  if (likeArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

function stringifyArray (value) {
  let res = ''
  let stringified
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) res += ' '
      res += stringified
    }
  }
  return res
}

function stringifyObject (value) {
  let res = ''
  for (const key in value) {
    if (value[key]) {
      if (res) res += ' '
      res += key
    }
  }
  return res
}

export function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

export function hump2dash (value) {
  return value.replace(/[A-Z]/g, function (match) {
    return '-' + match.toLowerCase()
  })
}

export function dash2hump (value) {
  return value.replace(/-([a-z])/g, function (match, p1) {
    return p1.toUpperCase()
  })
}

export function parseStyleText (cssText) {
  const res = {}
  const listDelimiter = /;(?![^(]*\))/g
  const propertyDelimiter = /:(.+)/
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      let tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (res[dash2hump(tmp[0].trim())] = tmp[1].trim())
    }
  })
  return res
}

export function genStyleText (styleObj) {
  let res = ''
  for (let key in styleObj) {
    if (styleObj.hasOwnProperty(key)) {
      let item = styleObj[key]
      res += `${hump2dash(key)}:${item};`
    }
  }
  return res
}

export function mergeObjectArray (arr) {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

export function normalizeDynamicStyle (value) {
  if (likeArray(value)) {
    return mergeObjectArray(value)
  }
  if (typeof value === 'string') {
    return parseStyleText(value)
  }
  return value
}

export function isEmptyObject (obj) {
  for (let key in obj) {
    return false
  }
  return true
}

export function processUndefined (obj) {
  let result = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== undefined) {
        result[key] = obj[key]
      } else {
        result[key] = ''
      }
    }
  }
  return result
}
