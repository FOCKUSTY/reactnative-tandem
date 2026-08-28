import ru from "./resources/ru.locale.json";

type Primitive = string;

type LeafKeys<T> = T extends Primitive
  ? never
  : {
      [K in keyof T]: T[K] extends Primitive
        ? `${K & string}`
        : T[K] extends object
          ? `${K & string}.${LeafKeys<T[K]>}`
          : never;
    }[keyof T];

type TypeByPath<
  T,
  Path extends string,
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? TypeByPath<T[Key], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

export type TranslationResources = typeof ru;

export type TranslationInput = LeafKeys<TranslationResources>;

export type TranslationValue<Input extends TranslationInput> = TypeByPath<
  TranslationResources,
  Input
>;
