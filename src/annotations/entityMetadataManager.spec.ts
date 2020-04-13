import manager, { MetadataType, Relationship, Member, PrimaryKey, ForeignKey, Navigator, MemberConstraints } from './entityMetadataManager'
import Constraint from '../constants/constraints'

describe('Metadata Manager', () => {
  class Foo {
  }

  class Bar {
  }

  it('register & unregister & getMembers, getPrimaryKeys, getForeignKeys, getNavigator, getBehavior, getMemberConstraints', () => {
    manager.register<Member>(Foo.prototype, MetadataType.Member, {
      fieldName: 'newProperty',
      propertyName: 'newProperty'
    })
    manager.register<Member>(Foo.prototype, MetadataType.Member, {
      fieldName: 'newProperty',
      propertyName: 'newProperty'
    })
    expect(manager.getMembers(Foo.prototype)).toHaveLength(2)

    expect(manager.getMemberConstraints(Foo.prototype)).toEqual({})
    expect(manager.getMemberConstraints(Foo.prototype)['newProperty']).toBeUndefined()
    manager.register<MemberConstraints>(Foo.prototype, MetadataType.Constraint, {
      propertyName: 'newProperty',
      constraints: Constraint.NON_EMPTY_ON_ADDED
    })
    expect(manager.getMemberConstraints(Foo.prototype)).toEqual({
      'newProperty': Constraint.NON_EMPTY_ON_ADDED
    })

    manager.register<MemberConstraints>(Foo.prototype, MetadataType.Constraint, {
      propertyName: 'newProperty',
      constraints: Constraint.NON_EMPTY_ON_ADDED | Constraint.NON_EMPTY_ON_MODIFIED
    })

    const allConstraints = manager.getMemberConstraints(Foo.prototype)['newProperty']
    expect(allConstraints).toBeDefined()
    expect(allConstraints! & Constraint.NON_EMPTY_ON_ADDED).toBe(Constraint.NON_EMPTY_ON_ADDED)
    expect(allConstraints! & Constraint.NON_EMPTY_ON_MODIFIED).toBe(Constraint.NON_EMPTY_ON_MODIFIED)

    manager.register<PrimaryKey>(Foo.prototype, MetadataType.PrimaryKey, {
      fieldName: 'newProperty',
      propertyName: 'newProperty'
    })
    expect(manager.getPrimaryKeys(Foo.prototype)).toHaveLength(1)

    manager.register<ForeignKey>(Foo.prototype, MetadataType.ForeignKey, {
      fieldName: 'newProperty',
      propertyName: 'newProperty',
      constructor: Bar,
      navigatorName: 'bid'
    })
    expect(manager.getForeignKeys(Foo.prototype)).toHaveLength(1)

    manager.register(Foo.prototype, MetadataType.Behavior, { url: '', method: 'GET', behaviorName: 'load' })
    expect(manager.getBehavior(Foo.prototype, 'load')).not.toBeUndefined()

    manager.register<Navigator>(Foo.prototype, MetadataType.Navigator, {
      relationship: Relationship.One,
      navigatorName: 'hello',
      fieldName: 'world',
      propertyName: 'We'
    })
    expect(manager.getNavigator(Foo.prototype, 'hello')).not.toBeUndefined()

    manager.unregister(Foo.prototype)
    expect(manager.getMembers(Foo.prototype)).toHaveLength(0)
  })
})
