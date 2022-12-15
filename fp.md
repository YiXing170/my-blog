compose实现

```javascript
const compose = (...fns) =>{
    return (x) => fns.reduceRight((res,fn)=>fn(res),x)
}
```

pipe实现

```javascript
const pipe = (...fns) =>{
    return (x) => fns.reduce((res,fn)=>fn(res),x)
}
```

