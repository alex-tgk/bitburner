import { DispatchController } from '/controller/dispatch-controller'

export class HackingController {
  private dispatcher: DispatchController
  private ns: NS
  public constructor(ns: NS, dispatcher?: DispatchController) {
    this.ns = ns
    this.dispatcher = dispatcher || new DispatchController(ns)
  }
}
