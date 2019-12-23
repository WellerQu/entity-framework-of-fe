import manager, { MetadataType, Relationship } from './metadataManager'

describe('Metadata Manager', () => {
  class Foo {
  }

  class Bar {

  }

  it('register & unregister & getMembers, getPrimaryKeys, getForeignKeys', () => {
    manager.register(Foo.prototype, MetadataType.Member, {
      fieldName: 'newProperty'
    })
    manager.register(Foo.prototype, MetadataType.Member, {
      fieldName: 'newProperty'
    })
    expect(manager.getMembers(Foo.prototype)).toHaveLength(2)

    manager.register(Foo.prototype, MetadataType.PrimaryKey, {
      fieldName: 'newProperty'
    })
    expect(manager.getPrimaryKeys(Foo.prototype)).toHaveLength(1)

    manager.register(Foo.prototype, MetadataType.ForeignKey, {
      fieldName: 'newProperty',
      relationship: Bar.prototype,
      navigator: 'bid'
    })
    expect(manager.getForeignKeys(Foo.prototype)).toHaveLength(1)

    manager.register(Foo.prototype, MetadataType.Behavior, { url: '', method: 'GET', behaviorName: 'load' })
    expect(manager.getBehavior(Foo.prototype, 'load')).not.toBeUndefined()

    manager.register(Foo.prototype, MetadataType.Navigator, { relationship: Relationship.One, navigatorName: 'hello', fieldName: 'world' })
    expect(manager.getNavigator(Foo.prototype, 'hello')).not.toBeUndefined()

    manager.unregister(Foo.prototype)
    expect(manager.getMembers(Foo.prototype)).toHaveLength(0)
  })
})
