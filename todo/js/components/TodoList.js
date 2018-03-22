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

import MarkAllTodosMutation from '../mutations/MarkAllTodosMutation';
import Todo from './Todo';

import React from 'react';
import {
  createPaginationContainer,
  createFragmentContainer,
  graphql,
} from 'react-relay';

class TodoList extends React.Component {
  _handleMarkAllChange = (e) => {
    const complete = e.target.checked;
    MarkAllTodosMutation.commit(
      this.props.relay.environment,
      complete,
      this.props.viewer.todos,
      this.props.viewer,
    );
  };
  renderTodos() {
    console.log('todos', this.props.viewer.todos);
    console.log('number of edges',this.props.viewer.todos.edges.length);

    return this.props.viewer.todos.edges.map(edge =>
      <Todo
        key={edge.node.__id}
        todo={edge.node}
        viewer={this.props.viewer}
      />
    );
  }

  _loadMore() {
//console.log(this.props.relay.edgeCount());

    if (!this.props.relay.hasMore()) {
      console.log(`Nothing more to load`)
      return
    } else if (this.props.relay.isLoading()) {
      console.log(`Request is already pending`)
      return
    }

    this.props.relay.loadMore(10)
  }
  render() {
    const numTodos = this.props.viewer.totalCount;
    const numCompletedTodos = this.props.viewer.completedCount;
    return (
      <section className="main">
        <input
          checked={numTodos === numCompletedTodos}
          className="toggle-all"
          onChange={this._handleMarkAllChange}
          type="checkbox"
        />
        <label htmlFor="toggle-all">
          Mark all as complete
        </label>
        <ul className="todo-list">
          {this.renderTodos()}
        </ul>
        <div>
          {this.props.relay.hasMore() &&
          <div onClick={() => this._loadMore()}>More</div>
          }
        </div>
      </section>
    );
  }
}

export default createPaginationContainer(TodoList, {
  viewer: graphql`
    fragment TodoList_viewer on User {
      todos(
        first: $count,  # max GraphQLInt
        after: $after
      ) @connection(key: "TodoList_todos") {
        edges {
          node {
            ...Todo_todo,
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      },
      id,
      totalCount,
      completedCount,
      ...Todo_viewer,

    }
  `,
},
  {
    direction: 'forward',
    query: graphql`
      query TodoListForwardQuery(
        $count: Int!,
        $after: String,
      ) {
        viewer {
          ...TodoList_viewer
        }
      }
    `,
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.todos
    },
    getFragmentVariables(previousVariables, totalCount) {
      return {
        ...previousVariables,
        count: totalCount,
      }
    },
    getVariables(props, paginationInfo, fragmentVariables) {
      return {
        count: paginationInfo.count,
        after: paginationInfo.cursor,
      }
    },
  }

);
