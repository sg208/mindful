/** Test-only stand-in for Astro's virtual `astro:content` module. */
export type CollectionEntry<_Name extends string> = {
  id: string;
  body?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors Astro's loose entry data
  data: any;
};

export const getCollection = async (
  _name: string,
  _filter?: (entry: CollectionEntry<string>) => boolean,
): Promise<CollectionEntry<string>[]> => [];
