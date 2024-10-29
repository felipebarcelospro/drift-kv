import { KvEntry, KvEntryMaybe } from "@deno/kv";
import { z } from "zod";
import { DriftEntity } from "../generators/DriftEntity";
import { DriftQueryArgs } from "../types";
import { KeyManager } from "./KeyManager";

/**
 * Manages the search and filtering of entries in the database.
 */
export class SearchManager<T extends DriftEntity<any, any, any>> {
  /**
   * Filters entries based on the provided query arguments.
   *
   * @param items - An array of KvEntryMaybe objects to be filtered.
   * @param where - Optional query conditions to filter the entries.
   * @returns An array of KvEntry objects that match the query conditions.
   */
  public filterEntries<T extends DriftEntity<any, any, any>>(
    items: KvEntryMaybe<z.output<T["schema"]>>[],
    where?: DriftQueryArgs<T>["where"],
  ): KvEntry<z.output<T["schema"]>>[] {
    const filteredItems = items.filter(
      (item): item is KvEntry<z.output<T["schema"]>> => {
        if (!KeyManager.isKeyEntry(item)) {
          return false;
        }

        if (!where) {
          return true;
        }

        return Object.entries(KeyManager.removeVersionstamp(where)).every(([key, value]) =>
          this.isMatchingValue(item.value[key], value),
        );
      },
    );

    return filteredItems;
  }

  /**
   * Checks if two values match based on their types.
   *
   * @param a - The first value to compare.
   * @param b - The second value to compare.
   * @returns A boolean indicating whether the values match.
   */
  private isMatchingValue(a: unknown, b: unknown) {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (b instanceof Array) {
      return b.includes(a);
    }
    return a === b;
  }
}
