import { describe, expect, it } from 'vitest';
import { parseCsv, toRecords } from '../../scripts/lib/csv.mjs';

describe('parseCsv', () => {
  it('splits plain rows and cells', () => {
    expect(parseCsv('a,b\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('keeps commas, newlines and escaped quotes inside quoted cells', () => {
    const input = 'title,body\r\n"Hello, world","Line one\nsaid ""hi"""\r\n';
    expect(parseCsv(input)).toEqual([
      ['title', 'body'],
      ['Hello, world', 'Line one\nsaid "hi"'],
    ]);
  });

  it('keeps a final row without a trailing newline', () => {
    expect(parseCsv('a\nlast')).toEqual([['a'], ['last']]);
  });
});

describe('toRecords', () => {
  it('maps rows to objects keyed by header and skips blank rows', () => {
    const rows = [['slug', 'title'], ['one', 'First'], ['', ''], ['two']];
    expect(toRecords(rows)).toEqual([
      { slug: 'one', title: 'First' },
      { slug: 'two', title: '' },
    ]);
  });
});
