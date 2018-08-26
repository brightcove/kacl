const { getPackageUrl, init, lint, release } = require('../src');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const pkg = fs.readFileSync(path.join(__dirname, 'pkg.json'), 'utf8');
const initChangelog = fs.readFileSync(path.join(__dirname, 'changelog.init.md'), 'utf8');
const emptyChangelog = fs.readFileSync(path.join(__dirname, 'changelog.empty.md'), 'utf8');
const conflictChangelog = fs.readFileSync(path.join(__dirname, 'changelog.conflict.md'), 'utf8');
const noUnreleasedChangelog = fs.readFileSync(path.join(__dirname, 'changelog.nounreleased.md'), 'utf8');
const validChangelog = fs.readFileSync(path.join(__dirname, 'changelog.valid.md'), 'utf8');
const expectedChangelog = fs.readFileSync(path.join(__dirname, 'changelog.expected.md'), 'utf8');

function checkPackageJson (func) {
  it('should fail if the package.json doesn\'t exist', () => {
    fs.readFileSync.throws(new Error('No such file'));
    expect(() => {
      func();
    }).to.throw(/Unable to access package\.json: No such file/);
  });

  it('should fail if the package.json doesn\'t have a repository', () => {
    fs.readFileSync.returns('{}');
    expect(() => {
      func();
    }).to.throw(/No repository URL found in package\.json/);
  });

  it('should fail if the package.json doesn\'t have a repository URL', () => {
    fs.readFileSync.returns('{"repository":{}}');
    expect(() => {
      func();
    }).to.throw(/No repository URL found in package\.json/);
  });

  it('should fail if the package.json repository URL is not valid', () => {
    fs.readFileSync.returns('{"repository":{"url": "git://foo"}}');
    expect(() => {
      func();
    }).to.throw(/Repository URL in package\.json must be a valid URL to a git repository/);
  });
}

function checkChangelog (func) {
  it('should fail if the changelog doesn\'t exist', () => {
    fs.readFileSync.withArgs('package.json').returns(pkg);
    fs.readFileSync.withArgs('CHANGELOG.md').throws(new Error('No such file'));
    expect(() => {
      func();
    }).to.throw(/Unable to read changelog: No such file/);
  });
}

function checkNoChanges (func) {
  it('should fail if there is no unreleased section', () => {
    fs.readFileSync.withArgs('package.json').returns(pkg);
    fs.readFileSync.withArgs('CHANGELOG.md').returns(emptyChangelog);

    expect(() => {
      func();
    }).to.throw(/No changes to the Changelog for release/);
  });

  it('should fail if there are no changes to release', () => {
    fs.readFileSync.withArgs('package.json').returns(pkg);
    fs.readFileSync.withArgs('CHANGELOG.md').returns(initChangelog);

    expect(() => {
      func();
    }).to.throw(/No changes to the Changelog for release/);
  });
}

describe('index', () => {
  beforeEach(() => {
    sinon.stub(fs, 'readFileSync');
    sinon.stub(fs, 'writeFileSync');
    sinon.useFakeTimers(1535070715127);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getPackageUrl', () => {
    it('should do nothing for a standard https url', () => {
      expect(getPackageUrl('https://github.com/brightcove/kacl')).to.equal('https://github.com/brightcove/kacl');
    });
    
    it('should strip the ending .git from an https url', () => {
      expect(getPackageUrl('https://github.com/brightcove/kacl.git')).to.equal('https://github.com/brightcove/kacl');
    });

    it('should convert a git@ url', () => {
      expect(getPackageUrl('git@github.com:brightcove/kacl.git')).to.equal('https://github.com/brightcove/kacl');
    });
    
    it('should convert an ssh url', () => {
      expect(getPackageUrl('ssh://github.com:brightcove/kacl.git')).to.equal('https://github.com/brightcove/kacl');
    });
    
    it('should convert an ssh://git@ url', () => {
      expect(getPackageUrl('ssh://git@github.com:brightcove/kacl.git')).to.equal('https://github.com/brightcove/kacl');
    });
    
    it('should convert a git+https url', () => {
      expect(getPackageUrl('git+https://github.com/brightcove/kacl.git')).to.equal('https://github.com/brightcove/kacl');
    });

    it('should convert a git+ssh url', () => {
      expect(getPackageUrl('git+ssh://git@github.com:brightcove/kacl.git')).to.equal('https://github.com/brightcove/kacl');
    });

    it('should work with ports on ssh urls', () => {
      expect(getPackageUrl('ssh://git@github.com:1234:brightcove/kacl.git')).to.equal('https://github.com:1234/brightcove/kacl');
    });
  });

  describe('init', () => {
    checkPackageJson(init);

    it('should initialize a new changelog', () => {
      fs.readFileSync.returns(pkg);
      init();
      expect(fs.writeFileSync).to.have.been.calledOnce;
      expect(fs.writeFileSync).to.have.been.calledWith('CHANGELOG.md', initChangelog);
    });
  });

  describe('lint', () => {
    checkPackageJson(lint);
    checkChangelog(lint);

    it('should pass for a valid changelog', () => {
      fs.readFileSync.withArgs('package.json').returns(pkg);
      fs.readFileSync.withArgs('CHANGELOG.md').returns(initChangelog);
      expect(() => {
        lint();
      }).to.not.throw();
    });

    checkNoChanges(() => lint(true));

    it('should pass for release with a valid changelog', () => {
      fs.readFileSync.withArgs('package.json').returns(pkg);
      fs.readFileSync.withArgs('CHANGELOG.md').returns(conflictChangelog);
      expect(() => {
        lint(true);
      }).to.not.throw();
    });
  });

  describe('release', () => {
    checkPackageJson(release);
    checkChangelog(release);
    checkNoChanges(release);

    it ('should fail if the release already exists and there are changes', () => {
      fs.readFileSync.withArgs('package.json').returns(pkg);
      fs.readFileSync.withArgs('CHANGELOG.md').returns(conflictChangelog);
      expect(() => {
        release();
      }).to.throw(/Release already exists, did you mean to bump your package's version\?/);
    });

    it('should pass if the release already exists and there is no unreleased section', () => {
      fs.readFileSync.withArgs('package.json').returns(pkg);
      fs.readFileSync.withArgs('CHANGELOG.md').returns(noUnreleasedChangelog);
      expect(() => {
        release();
      }).to.not.throw();
      expect(fs.writeFileSync).to.not.have.been.called;
    });

    it('should create a new release', () => {
      fs.readFileSync.withArgs('package.json').returns(pkg);
      fs.readFileSync.withArgs('CHANGELOG.md').returns(validChangelog);
      expect(() => {
        release();
      }).to.not.throw();
      expect(fs.writeFileSync).to.have.been.calledOnce;
      expect(fs.writeFileSync).to.have.been.calledWith('CHANGELOG.md', expectedChangelog);
    });
  });
});