import { genId } from "../utils.js";
import { createBaseListService } from "./base.js";

function createNewItem(itemData) {
  const id = genId();
  const key = itemData?.key;

  if (!key) {
    return;
  }

  const newItem = {
    id,
    name: key,
    key,
    values: [],
    open: true,
  };
  return newItem;
}

function createCookieService() {
  const storageKey = "cookieList";

  const baseListService = createBaseListService({
    storageKey,
  });

  async function setShowingValue({ id, showingValue }) {
    const result = await baseListService.update(
      {
        showingValue,
      },
      id,
    );

    return result;
  }

  async function addValue({ id, name, value }) {
    const item = await baseListService.getById(id);

    if (!item) {
      throw new Error("cookie not found");
    }

    const values = item.values || [];

    const newItem = {
      ...item,
      values: [
        ...values,
        {
          id: genId(),
          name: name || "",
          value: value || "",
        },
      ],
    };

    await baseListService.update(newItem, id);
  }

  async function deleteValue({ id, valueId }) {
    const item = await baseListService.getById(id);

    if (!item) {
      throw new Error("cookie not found");
    }

    const newItem = {
      ...item,
      values: item.values.filter((d) => d.id !== valueId),
    };

    await baseListService.update(newItem, id);
  }

  async function updateValue({ id, valueId, name, value }) {
    const item = await baseListService.getById(id);

    if (!item) {
      throw new Error("cookie not found");
    }

    const newItem = {
      ...item,
      values: item.values.map((d) => {
        if (d.id === valueId) {
          return {
            ...d,
            name: name || "",
            value: value || "",
          };
        }

        return d;
      }),
    };

    await baseListService.update(newItem, id);
  }

  return {
    ...baseListService,
    createNewItem,
    addValue,
    deleteValue,
    updateValue,
    setShowingValue,
  };
}

const cookieService = createCookieService();

export { cookieService };
