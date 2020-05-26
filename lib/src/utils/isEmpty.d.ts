/**
 * 判断值是否为空
 *
 * a -> boolean
 *
 * @author nixon
 * @since 2019-07-17 13:42:07
 *
 * @example
 * import isEmpty from 'utils/isEmpty'
 * isEmpty('a') // => false
 * isEmpty(0) // => false
 * isEmpty(true) // => false
 * isEmpty(false) // => false
 * isEmpty('') // => true
 * isEmpty('  ') // => true
 * isEmpty({}) // => true
 * isEmpty([]) // => true
 * isEmpty(null) // => true
 * isEmpty(undefined) // => true
 */
declare const isEmpty: (value: any) => boolean;
export default isEmpty;
