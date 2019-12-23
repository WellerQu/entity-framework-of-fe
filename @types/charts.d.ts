declare namespace charts {
  interface Functor<T> {
    (dom: HTMLDivElement): T;
    of: Functor<T>;
  }
}

export as namespace charts