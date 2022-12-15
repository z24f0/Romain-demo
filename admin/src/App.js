import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  HydraAdmin,
  ResourceGuesser,
  ListGuesser,
  ShowGuesser,
  CreateGuesser,
  EditGuesser,
  FieldGuesser,
  InputGuesser,
  hydraDataProvider as baseHydraDataProvider,
  fetchHydra as baseFetchHydra,
  useIntrospection,
} from "@api-platform/admin";
import { parseHydraDocumentation } from '@api-platform/api-doc-parser';
import {
  AutocompleteInput,
  ReferenceField,
  ReferenceInput,
  TextField,
} from "react-admin";
import authProvider from "./authProvider";
import Login from "./layout/Login";

const entrypoint = process.env.REACT_APP_API_ENTRYPOINT;

const ReviewsList = (props) => (
  <ListGuesser {...props}>
    <FieldGuesser source="author" />
    <FieldGuesser source="book" />
    {/* Use react-admin components directly when you want complex fields. */}
    <ReferenceField label="Book's title" source="book" reference="books">
      <TextField source="title" />
    </ReferenceField>

    {/* While deprecated fields are hidden by default, using an explicit FieldGuesser component allows to add them back. */}
    <FieldGuesser source="letter" />
  </ListGuesser>
);

const ReviewsShow = (props) => (
  <ShowGuesser {...props}>
    <FieldGuesser source="author" addLabel={true} />
    <FieldGuesser source="book" addLabel={true} />
    <FieldGuesser source="rating" addLabel={true} />

    {/* While deprecated fields are hidden by default, using an explicit FieldGuesser component allows to add them back. */}
    <FieldGuesser source="letter" addLabel={true} />

    <FieldGuesser source="body" addLabel={true} />
    <FieldGuesser source="publicationDate" addLabel={true} />
  </ShowGuesser>
);

const ReviewsCreate = (props) => (
  <CreateGuesser {...props}>
    <InputGuesser source="author" />
    {/* Use react-admin components directly when you want complex inputs. */}
    <ReferenceInput
      source="book"
      reference="books"
      label="Books"
      filterToQuery={(searchText) => ({ title: searchText })}
    >
      <AutocompleteInput optionText="title" />
    </ReferenceInput>

    <InputGuesser source="rating" />

    {/* While deprecated fields are hidden by default, using an explicit InputGuesser component allows to add them back. */}
    <InputGuesser source="letter" />

    <InputGuesser source="body" />
    <InputGuesser source="publicationDate" />
  </CreateGuesser>
);

const ReviewsEdit = (props) => (
  <EditGuesser {...props}>
    <InputGuesser source="author" />

    {/* Use react-admin components directly when you want complex inputs. */}
    <ReferenceInput
      source="book"
      reference="books"
      label="Books"
      filterToQuery={(searchText) => ({ title: searchText })}
    >
      <AutocompleteInput optionText="title" />
    </ReferenceInput>

    <InputGuesser source="rating" />

    {/* While deprecated fields are hidden by default, using an explicit InputGuesser component allows to add them back. */}
    <InputGuesser source="letter" />

    <InputGuesser source="body" />
    <InputGuesser source="publicationDate" />
  </EditGuesser>
);

const getHeaders = () =>
  localStorage.getItem("token")
    ? {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    : {};
const fetchHydra = (url, options = {}) =>
  baseFetchHydra(url, {
    ...options,
    headers: getHeaders,
  });
const RedirectToLogin = () => {
  const introspect = useIntrospection();

  if (localStorage.getItem("token")) {
    introspect();
    return <></>;
  }
  return <Redirect to="/login" />;
};
const apiDocumentationParser = async (entrypoint) => {
  try {
    const { api } = await parseHydraDocumentation(entrypoint, {
      headers: getHeaders,
    });
    return { api };
  } catch (result) {
    // Only useful when the API endpoint is secured
    if (result.status === 401) {
      // Prevent infinite loop if the token is expired
      localStorage.removeItem("token");
      return {
        api: result.api,
        customRoutes: [<Route path="/" component={RedirectToLogin} />],
      };
    }
    throw result;
  }
};
const dataProvider = baseHydraDataProvider(
  entrypoint,
  fetchHydra,
  apiDocumentationParser
);

export default () => (
  <HydraAdmin
    entrypoint={entrypoint}
    dataProvider={dataProvider}
    authProvider={authProvider}
    loginPage={Login}
  >
    <ResourceGuesser name="books" />
    <ResourceGuesser
      name="reviews"
      list={ReviewsList}
      show={ReviewsShow}
      create={ReviewsCreate}
      edit={ReviewsEdit}
    />

    {/* While deprecated resources are hidden by default, using an explicit ResourceGuesser component allows to add them back. */}
    <ResourceGuesser name="parchments" />
  </HydraAdmin>
);
