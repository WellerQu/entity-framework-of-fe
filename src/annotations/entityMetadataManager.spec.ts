import manager, { MetadataType, Relationship, Member, PrimaryKey, ForeignKey, Navigator } from './entityMetadataManager'

describe('Metadata Manager', () => {
  class Foo {
  }

  class Bar {

  }

  it('register & unregister & getMembers, getPrimaryKeys, getForeignKeys', () => {
    manager.register<Member>(Foo.prototype, MetadataType.Member, {
      fieldName: 'newProperty',
      propertyName: 'newProperty'
    })
    manager.register<Member>(Foo.prototype, MetadataType.Member, {
      fieldName: 'newProperty',
      propertyName: 'newProperty'
    })
    expect(manager.getMembers(Foo.prototype)).toHaveLength(2)

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
