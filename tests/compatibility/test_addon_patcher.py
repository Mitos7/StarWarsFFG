import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('patcher',Path(__file__).parents[2]/'scripts/apply-addon-patches.py')
patcher=importlib.util.module_from_spec(spec);spec.loader.exec_module(patcher)
class PatchTests(unittest.TestCase):
 def fixture(self,temp,transform=False):
  root=Path(temp);patcher.PATCHES=root/'patches';patcher.PATCHES.mkdir();modules=root/'modules';folder=modules/'example';folder.mkdir(parents=True)
  (folder/'module.json').write_text(json.dumps({'id':'example','version':'1'}))
  before=b'const value = 1;\n';after=b'const value = 2;\n';(folder/'main.js').write_bytes(before)
  entry={'path':'main.js','before_sha256':patcher.digest(before),'after_sha256':patcher.digest(after)}
  if transform:entry['replacements']=[{'old':'value = 1','new':'value = 2'}]
  else:
   (patcher.PATCHES/'example').mkdir();(patcher.PATCHES/'example/main.js').write_bytes(after.replace(b'\n',b'\r\n'))
  index={'modules':[{'id':'example','source_version':'1','patch_version':'1-mitos.1','files':[entry]}]}
  (patcher.PATCHES/'index.json').write_text(json.dumps(index));return modules,before,after
 def test_windows_payload_backup_and_idempotence(self):
  with tempfile.TemporaryDirectory() as temp:
   modules,before,after=self.fixture(temp);changes,_=patcher.prepare(modules,['example']);backup=patcher.apply(modules,changes)
   self.assertEqual((modules/'example/main.js').read_bytes(),after);self.assertEqual((backup/'example/main.js').read_bytes(),before)
   self.assertEqual(patcher.prepare(modules,['example'])[0],[])
 def test_transform_and_refuse_unknown_local_edits(self):
  with tempfile.TemporaryDirectory() as temp:
   modules,_,after=self.fixture(temp,True);changes,_=patcher.prepare(modules,['example']);self.assertEqual(changes[0][2],after)
   (modules/'example/main.js').write_text('User custom code')
   with self.assertRaisesRegex(ValueError,'Local changes'):patcher.prepare(modules,['example'])
   self.assertEqual((modules/'example/main.js').read_text(),'User custom code')
 def test_upgrade_only_known_previous_patch(self):
  with tempfile.TemporaryDirectory() as temp:
   modules,before,after=self.fixture(temp,True)
   previous=b'const value = 0;\n';(modules/'example/main.js').write_bytes(previous)
   path=patcher.PATCHES/'index.json';index=json.loads(path.read_text());entry=index['modules'][0]['files'][0]
   entry['previous_sha256']=[patcher.digest(previous)];entry['upgrade_replacements']=[{'old':'value = 0','new':'value = 2'}]
   path.write_text(json.dumps(index));changes,_=patcher.prepare(modules,['example'])
   self.assertEqual(changes[0][2],after)
if __name__=='__main__':unittest.main()
