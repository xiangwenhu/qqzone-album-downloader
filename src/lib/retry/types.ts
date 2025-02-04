export interface RetryTimeoutOption {
     /**
      * 因子
      */
     factor?: number;
     /**
      * 最小重试间隔
      */
     minTimeout?: number;
     /**
      * 最大重试间隔
      */
     maxTimeout?: number;
}


export interface RetryOptions extends RetryTimeoutOption {
     /**
      * 重试次数
      */
     attemptTimes?: number;
     /**
      * 参数
      */
     args?: any[] | null;
     /**
      * 上下文
      */
     context?: any
}



export type EventName =  "attemptError" | "complete" | "error";


// export interface IRetryTask {
//      new(options: RetryOptions): any;
//      reset(): any;
//      stop(): any;
//      attempt(): any;
// }


export type TaskRetryFun = (attemptTimes: number, error: any) => void;
export type TaskCompleteFun<R = any> = (attemptTimes: number, res: R) => void;
export type TaskErrorFun<E = any> = (error: E) => void
export type CommonFunction = (...args: any[]) => void;