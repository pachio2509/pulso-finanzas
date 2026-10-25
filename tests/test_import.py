import unittest,tempfile,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from import_data import install,validate
class ImportTest(unittest.TestCase):
 def sample(self,key='a',**changes):
  return {'events':[dict(key=key,description='Ejemplo ficticio',date='2026-01-15',amount=12.5,currency='MXN',**changes)],'pending':[]}
 def test_invalid_does_not_replace(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);source=p/'source.json';dest=p/'data.json'
   source.write_text(json.dumps(self.sample()));install(source,dest);before=dest.read_bytes()
   source.write_text('{"events":[{"key":"x","description":"x","amount":-2}]}')
   with self.assertRaises(ValueError):install(source,dest)
   self.assertEqual(before,dest.read_bytes())
 def test_missing_keys_require_intent_and_keep_backup(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);source=p/'source.json';dest=p/'data.json'
   source.write_text(json.dumps(self.sample()));install(source,dest);before=dest.read_bytes()
   source.write_text(json.dumps(self.sample('b')))
   with self.assertRaises(ValueError):install(source,dest)
   self.assertEqual(before,dest.read_bytes());install(source,dest,replace=True)
   self.assertEqual(next((p/'backups').glob('*.json')).read_bytes(),before)
 def test_duplicate_keys_rejected(self):
  d=self.sample();d['events']*=2
  with self.assertRaises(ValueError):validate(d)
 def test_original_unchanged_and_idempotent(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);source=p/'source.json';dest=p/'private'/'data.json';source.write_text(json.dumps(self.sample()));before=source.read_bytes()
   install(source,dest);self.assertEqual(install(source,dest),'Sin cambios.');self.assertEqual(source.read_bytes(),before)
if __name__=='__main__':unittest.main()

