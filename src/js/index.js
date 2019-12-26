import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ActionCable from 'actioncable';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';
import { setContext } from 'apollo-link-context'
import gql from 'graphql-tag'

const cable = ActionCable.createConsumer('ws://ws-dev.markeaze.test:3334/cable')

const httpLink = new HttpLink({
  uri: 'http://api-dev.markeaze.test:3001/api/v1/graphql'
});

const channelName = "ApplicationCable::GraphqlChannel"
const connectionParams = {authToken: 'xxx'}

const hasSubscriptionOperation = ({ query: { definitions } }) => {
  return definitions.some(
    ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
  )
}

const link = ApolloLink.split(
  hasSubscriptionOperation,
  new ActionCableLink({cable, connectionParams, channelName}),
  httpLink
);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
});

const subscription = gql `
  subscription($id: Int!) {
    visitorUpdate(id: $id){
      visitor {
        id
        first_name
      }
      user_id
    }
  }
`;

const query = gql `
  query {
    currentUser{
      email
    }
  } 
`;

window.client = client;
window.subscription = subscription;
window.query = query;

// client.subscribe({query: subscription, variables: {id: 2}}).subscribe({
//     next(data) {console.log(data);},
//     error(err) { console.log('err', err); },
//   });


