/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getResource = /* GraphQL */ `
  query GetResource($id: ID!) {
    getResource(id: $id) {
      id
      name
      description
      image
      isLive
      url
      createdAt
      updatedAt
    }
  }
`;
export const listResources = /* GraphQL */ `
  query ListResources(
    $filter: ModelResourceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listResources(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        image
        isLive
        url
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const aliasQuery = /*GraphQl*/ `
  query {
    live: getResource(id: "e00bb7bf-da9f-4c1d-b352-f84d26c587b6"){
      id
      name
      image
      isLive
      url
    },
    resources: listResources(filter: 
      {id: {notContains: "e00bb7bf-da9f-4c1d-b352-f84d26c587b6"}
      }) {
      items{
        id
        name
        image
        isLive
        url
      }
    }
  }
`;


