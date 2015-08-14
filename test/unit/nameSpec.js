describe('A Name', function() {
  it('is constructed from a string', function() {
    var name = FS.createName('fulltext');
    expect(name.$getFullText()).toBe('fulltext');
  });

  it('is constructed from an object', function() {
    var name = FS.createName({type: 'type', $givenName: 'given', $surname: 'surname', $prefix: 'prefix', $suffix: 'suffix',
                                      $fullText: 'fulltext', preferred: true, $changeMessage: 'changeMessage'});
    expect(name.type).toBe('type');
    expect(name.$getGivenName()).toBe('given');
    expect(name.$getSurname()).toBe('surname');
    expect(name.$getPrefix()).toBe('prefix');
    expect(name.$getSuffix()).toBe('suffix');
    expect(name.$getFullText()).toBe('fulltext');
    expect(name.preferred).toBe(true);
    expect(name.attribution.changeMessage).toBe('changeMessage');
  });

  it('is updated correctly', function() {
    var name = FS.createName();
    name.$setType('type');
    expect(name.type).toBe('type');
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setPreferred(true);
    expect(name.preferred).toBe(true);
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setFullText('fulltext');
    expect(name.$getFullText()).toBe('fulltext');
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setGivenName('given');
    expect(name.$getGivenName()).toBe('given');
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setSurname('surname');
    expect(name.$getSurname()).toBe('surname');
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setPrefix('prefix');
    expect(name.$getPrefix()).toBe('prefix');
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setSuffix('suffix');
    expect(name.$getSuffix()).toBe('suffix');
    expect(name.$changed).toBe(true);

    name = FS.createName();
    name.$setChangeMessage('changeMessage');
    expect(name.attribution.changeMessage).toBe('changeMessage');
  });
});
