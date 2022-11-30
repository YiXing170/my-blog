const handleTryCatch = (handle: (e: Error) => void = errorHandle) =>
  (fn: (...args: any[]) => Promise<{}>) => async (...args: any[]) => {
    try {
      return [null, await fn(...args)];
    } catch (e) {
      return [handle(e)];
    }
  }

// 2. 定义各种各样的错误类型
// 我们可以把错误信息格式化，成为代码里可以处理的样式，比如包含错误码和错误信息
class DbError extends Error {
  public errmsg: string;
  public errno: number;
  constructor(msg: string, code: number) {
    super(msg);
    this.errmsg = msg || 'db_error_msg';
    this.errno = code || 20010;
  }
}
class ValidatedError extends Error {
  public errmsg: string;
  public errno: number;
  constructor(msg: string, code: number) {
    super(msg);
    this.errmsg = msg || 'validated_error_msg';
    this.errno = code || 20010;
  }
}

// 3. 错误处理的逻辑，这可能只是其中一类。通常错误处理都是按功能需求来划分
// 比如请求失败（200 但是返回值有错误信息），比如 node 中写 db 失败等。
const errorHandle = (e: Error) => {
  // do something
  if (e instanceof ValidatedError || e instanceof DbError) {
    // do sth
    return e;
  }
  return {
    code: 101,
    errmsg: 'unKnown'
  };
}
const usualHandleTryCatch = handleTryCatch(errorHandle);

// 以上的代码都是多个模块复用的，那实际的业务代码可能只需要这样。
async function main() {
  const [error, res] = await usualHandleTryCatch(fetchFail)(false);
  if (error) {
    // 因为 catch 已经做了拦截，甚至可以加入一些通用逻辑，这里甚至不用判断 if error
    console.log(error, 'error');
    return;
  }
  console.log(res, 'res');
}