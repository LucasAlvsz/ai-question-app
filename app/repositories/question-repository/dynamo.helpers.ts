import { AttributeValue } from "@aws-sdk/client-dynamodb";

type SupportedValue = string | number | boolean | null;

export const buildUpdateExpression = (fields: Record<string, SupportedValue>) => {
  const updateParts: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, AttributeValue> = {};

  const typeMap: Record<string, (value: SupportedValue) => AttributeValue> = {
    string: (value) => ({ S: value as string }),
    number: (value) => ({ N: value!.toString() }),
    boolean: (value) => ({ BOOL: value as boolean }),
    null: () => ({ NULL: true }),
  };

  for (const [key, value] of Object.entries(fields)) {
    const attr = `#${key}`;
    const val = `:${key}`;

    updateParts.push(`${attr} = ${val}`);
    names[attr] = key;

    const type = value === null ? "null" : typeof value;
    const converter = typeMap[type];

    if (!converter) {
      throw new Error(`Unsupported value type for key "${key}"`);
    }

    values[val] = converter(value);
  }

  return {
    UpdateExpression: `SET ${updateParts.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
};
