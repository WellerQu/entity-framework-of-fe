import manager, { MetadataType } from './metadataManager'

describe('Metadata Manager', () => {
  class Foo {
  }

  class Bar {

  }

  it('register & unregister & getMembers, getPrimaryKeys, getForeignKeys', () => {
    manager.register(Foo.prototype, MetadataType.Member, {
      keyName: 'newProperty'
    })
    manager.register(Foo.prototype, MetadataType.Member, {
      keyName: 'newProperty'
    })
    expect(manager.getMembers(Foo.prototype)).toHaveLength(2)

    manager.register(Foo.prototype, MetadataType.PrimaryKey, {
      keyName: 'newProperty'
    })
    expect(manager.getPrimaryKeys(Foo.prototype)).toHaveLength(1)

    manager.register(Foo.prototype, MetadataType.ForeignKey, {
      keyName: 'newProperty',
      relationship: Bar.prototype,
      navigator: 'bid'
    })
    expect(manager.getForeignKeys(Foo.prototype)).toHaveLength(1)

    manager.register(Foo.prototype, MetadataType.ListBehavior, { url: '', method: 'GET' })

    manager.unregister(Foo.prototype)

    expect(manager.getMembers(Foo.prototype)).toHaveLength(0)
  })
})
