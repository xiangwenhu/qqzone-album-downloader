import RetryTask from "./RetryTask";

class RetryAsyncTask extends RetryTask {
    protected attempt() {
        try {
            const { context, args } = this.options;
            Promise.resolve()
                .then(() => this.fn!.apply(context, args))
                .then((res) => this._onComplete(res))
                .catch((err) => this.retry(err));
        } catch (err) {
            this.retry(err);
        }
    }
}

export default RetryAsyncTask;
