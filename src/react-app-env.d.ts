declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes;
}