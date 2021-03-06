import { Generic, Of } from "tshkt"
import { At, at } from "./At"
import { Lens } from "./Lens"
import { TypeFunction2, Ap } from "./TypeFunctions"
import { ComposeIso } from "./ComposeIso"
import { Fields, Strict } from "./utils"
import { Affine } from "./Affine"
import { ComposeLens } from "./ComposeLens";
import { ComposeAt } from "./ComposeAt";

interface AtIso$λ<A> extends TypeFunction2 {
  type: Lens<Of<this["arguments"][0], A>, this["arguments"][1]>
}

export class Iso<T, B> {
  [Generic.repr]: Generic<Iso$λ, [T, B]>

  static id<A>(): Iso<A, A> {
    return ID_ISO as Iso<A, A>
  }

  constructor(private _from: (a: T) => B, private _into: (b: B) => T) {}

  view(a: T): B {
    return this._from(a)
  }

  review(b: B): T {
    return this._into(b)
  }

  inverse(): Iso<B, T> {
    return new Iso(this._into, this._from)
  }

  toLens(): Lens<T, B> {
    return new Lens(this._from, _ => this._into)
  }

  at<K extends Fields<B>>(key: K): Lens<T, B[K]> {
    return this.toLens().at(key)
  }

  peek<K extends Fields<B>>(key: K): Affine<T, Strict<B[K]>> {
    return this.toLens().peek(key)
  }

  [ComposeLens.composeLens]<S>(source: Lens<S, T>): Lens<S, B> {
    return new Lens(s => this.view(source.view(s)), s => b => source.set(s, this.review(b)))
  }

  [ComposeIso.composeIso]<AA>(source: Iso<AA, T>): Iso<AA, B> {
    return new Iso(aa => this.view(source.view(aa)), b => source.review(this.review(b)))
  }

  compose<F, C>(other: ComposeIso<F, T, B, C>): Of<F, [T, C]> {
    return other[ComposeIso.composeIso](this)
  }

  [ComposeAt.Transform]: Ap<T>
  [ComposeAt.composeAt]<S>(at: At<S>) {
    return at.toLens<T>().compose(this)
  }
}

const ID_ISO: Iso<unknown, unknown> = new Iso(x => x, x => x)

interface Iso$λ extends TypeFunction2 {
  type: Iso<this["arguments"][0], this["arguments"][1]>
}
