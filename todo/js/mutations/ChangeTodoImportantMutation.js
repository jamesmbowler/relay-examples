/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  commitMutation,
  graphql,
} from 'react-relay';

const mutation = graphql`
  mutation ChangeTodoImportantMutation($input: ChangeTodoImportantInput!) {
    changeTodoImportant(input: $input) {
      todo {
        id
        important
      }
      viewer {
        id
      }
    }
  }
`;

function getOptimisticResponse(important, todo, user) {
  const viewerPayload = {id: user.id};

  return {
    changeTodoImportant: {
      todo: {
        important: important,
        id: todo.id,
      },
      viewer: viewerPayload,
    },
  };
}

function commit(
  environment,
  important,
  todo,
  user,
) {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {important, id: todo.id},
      },
      optimisticResponse: getOptimisticResponse(important, todo, user),
    }
  );
}

export default {commit};
