import axios, {AxiosError, AxiosRequestConfig, AxiosResponse, Method, RawAxiosRequestHeaders} from "axios";

export type Progress = (progressEvent: any) => void;

interface IAxiosService<T> {
  url: string;
  method: Method;
  body?: T;
  isFormData?: boolean;
  token?: string;
  noCache?: boolean;
  timeout?: number;
  onUploadProgress?: Progress;
  onDownloadProgress?: Progress;
  headers?: RawAxiosRequestHeaders;
  params?: object;
}

export function axiosService<Response = any, Body = any>(props: IAxiosService<Body>) {
  const {
    url,
    method,
    body,
    isFormData,
    noCache,
    onDownloadProgress,
    onUploadProgress,
    timeout,
    token,
    headers,
    params,
  } = props;

  let options: AxiosRequestConfig<Body> = {
    url,
    method: method,
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
    // timeout: timeout || timeout === 0 ? timeout : 10000,
    withCredentials: true,
  };

  if (timeout || timeout === 0) {
    options.timeout = timeout;
  } else if (method === "get") {
    options.timeout = 10000;
  }

  if (headers) {
    options.headers = Object.assign(options.headers || {}, headers);
  }
  if (token) {
    options.headers = Object.assign(options.headers || {}, {Authorization: "Bearer " + token});
  }

  if (noCache) {
    options.headers = Object.assign(options.headers || {}, {"Cache-Control": "no-cache"});
  }

  if (params && Object.keys(params)?.length) {
    options.params = params;
  }

  if (body) {
    options.data = body;
  }

  if (onUploadProgress) {
    options.onUploadProgress = onUploadProgress;
  }

  if (onDownloadProgress) {
    options.onDownloadProgress = onDownloadProgress;
  }
  return new Promise<AxiosResponse<Response>>((resolve, reject) => {
    axios(options)
      .then((res) => {
        resolve(res);
      })
      .catch((error: AxiosError<any>) => {
        if (error.response) {
          reject(error.response);
        } else if (error.request) {
          reject(error.request);
        } else {
          reject(error);
        }
      });
  });
}
