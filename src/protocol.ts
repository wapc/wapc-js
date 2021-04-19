export interface WapcProtocol {
  __console_log(ptr: number, len: number): void;
  __host_call(
    bd_ptr: number,
    bd_len: number,
    ns_ptr: number,
    ns_len: number,
    op_ptr: number,
    op_len: number,
    ptr: number,
    len: number,
  ): number;
  __host_response(ptr: number): void;
  __host_response_len(): number;
  __host_error_len(): number;
  __host_error(ptr: number): void;
  __guest_response(ptr: number, len: number): void;
  __guest_error(ptr: number, len: number): void;
  __guest_request(op_ptr: number, ptr: number): void;
}
