import Dexie from 'dexie';

const RuleFromSearchIndexedDB = new Dexie('RuleFromSearch');

RuleFromSearchIndexedDB.version(1).stores({
  rules: '++id, savedSearchId, sql, rawSql, config, source, createdAt',
});

export interface RuleFromSearchType {
  id: string;
  savedSearchId?: string;
  savedSearchName?: string;
  sql: string;
  rawSql: string;
  config: {
    [key: string]: unknown;
  };
  source: {
    name: string;
    kind: string;
    from: {
      tableName: string;
      databaseName: string;
    };
    connection: string;
  };
  createdAt: string;
}

class RuleFromSearchDb {
  static async add(ruleFromSearch: RuleFromSearchType) {
    await RuleFromSearchIndexedDB.table('rules').add(ruleFromSearch);
  }

  static async get(id: string) {
    const search = await RuleFromSearchIndexedDB.table<RuleFromSearchType>(
      'rules',
    ).get({
      id,
    });
    if (!search) {
      throw new Error('Search not found');
    }
    return search;
  }

  static async delete(id: string) {
    await RuleFromSearchIndexedDB.table('rules').delete(id);
  }
}

export { RuleFromSearchDb };
