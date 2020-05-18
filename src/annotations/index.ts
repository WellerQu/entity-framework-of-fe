import { MetadataContext, ConstraintOption } from './MetadataContext'

import { ConstraintMetadata } from './ConstraintMetadata'
import { MemberMetadata } from './MemberMetadata'
import { MappingMetadata } from './MappingMetadata'

const context = new MetadataContext([
  ConstraintMetadata,
  MemberMetadata,
  MappingMetadata
])

export default context
export { ConstraintOption }
