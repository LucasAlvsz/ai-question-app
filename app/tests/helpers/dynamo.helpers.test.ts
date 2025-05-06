import { buildUpdateExpression } from "@/repositories/question-repository/dynamo.helpers";

describe("buildUpdateExpression", () => {
  it("should build update expression for string field", () => {
    const fields = { name: "John" };
    const result = buildUpdateExpression(fields);

    expect(result).toEqual({
      UpdateExpression: "SET #name = :name",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: { ":name": { S: "John" } },
    });
  });

  it("should build update expression for number field", () => {
    const fields = { age: 30 };
    const result = buildUpdateExpression(fields);

    expect(result).toEqual({
      UpdateExpression: "SET #age = :age",
      ExpressionAttributeNames: { "#age": "age" },
      ExpressionAttributeValues: { ":age": { N: "30" } },
    });
  });

  it("should build update expression for boolean field", () => {
    const fields = { isActive: true };
    const result = buildUpdateExpression(fields);

    expect(result).toEqual({
      UpdateExpression: "SET #isActive = :isActive",
      ExpressionAttributeNames: { "#isActive": "isActive" },
      ExpressionAttributeValues: { ":isActive": { BOOL: true } },
    });
  });

  it("should build update expression for null field", () => {
    const fields = { middleName: null };
    const result = buildUpdateExpression(fields);

    expect(result).toEqual({
      UpdateExpression: "SET #middleName = :middleName",
      ExpressionAttributeNames: { "#middleName": "middleName" },
      ExpressionAttributeValues: { ":middleName": { NULL: true } },
    });
  });

  it("should build update expression for multiple fields", () => {
    const fields = { name: "Jane", age: 28, isActive: false };
    const result = buildUpdateExpression(fields);

    expect(result.UpdateExpression).toBe("SET #name = :name, #age = :age, #isActive = :isActive");
    expect(result.ExpressionAttributeNames).toEqual({
      "#name": "name",
      "#age": "age",
      "#isActive": "isActive",
    });
    expect(result.ExpressionAttributeValues).toEqual({
      ":name": { S: "Jane" },
      ":age": { N: "28" },
      ":isActive": { BOOL: false },
    });
  });

  it("should throw an error for unsupported types", () => {
    const fields = { data: {} as unknown as string };

    expect(() => buildUpdateExpression(fields)).toThrow('Unsupported value type for key "data"');
  });
});
