import { Fragment, KeyboardEvent, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Bookmark, Category, NewNotification } from '../../../interfaces';
import {
  createNotification,
  deleteBookmark,
  deleteBookmarkCategory,
  pinBookmarkCategory,
  reorderBookmarkCategories,
} from '../../../store/actions';
import { searchConfig } from '../../../utility';
import Icon from '../../UI/Icons/Icon/Icon';
import Table from '../../UI/Table/Table';
import { ContentType } from '../Bookmarks';
import classes from './BookmarkTable.module.css';

interface ComponentProps {
  contentType: ContentType;
  categories: Category[];
  pinBookmarkCategory: (category: Category) => void;
  deleteBookmarkCategory: (id: number) => void;
  updateHandler: (data: Category | Bookmark) => void;
  deleteBookmark: (bookmarkId: number, categoryId: number) => void;
  createNotification: (notification: NewNotification) => void;
  reorderBookmarkCategories: (categories: Category[]) => void;
}

const BookmarkTable = (props: ComponentProps): JSX.Element => {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [isCustomOrder, setIsCustomOrder] = useState<boolean>(false);

  // Copy categories array
  useEffect(() => {
    setLocalCategories([...props.categories]);
  }, [props.categories]);

  // Check ordering
  useEffect(() => {
    const order = searchConfig("useOrdering", "");

    if (order === "orderId") {
      setIsCustomOrder(true);
    }
  }, []);

  const deleteCategoryHandler = (category: Category): void => {
    const proceed = window.confirm(
      `Are you sure you want to delete ${category.name}? It will delete ALL assigned bookmarks`
    );

    if (proceed) {
      props.deleteBookmarkCategory(category.id);
    }
  };

  const deleteBookmarkHandler = (bookmark: Bookmark): void => {
    const proceed = window.confirm(
      `Are you sure you want to delete ${bookmark.name}?`
    );

    if (proceed) {
      props.deleteBookmark(bookmark.id, bookmark.categoryId);
    }
  };

  const keyboardActionHandler = (
    e: KeyboardEvent,
    category: Category,
    handler: Function
  ) => {
    if (e.key === "Enter") {
      handler(category);
    }
  };

  const dragEndHandler = (result: DropResult): void => {
    if (!isCustomOrder) {
      props.createNotification({
        title: "Error",
        message: "Custom order is disabled",
      });
      return;
    }

    if (!result.destination) {
      return;
    }

    const tmpCategories = [...localCategories];
    const [movedCategory] = tmpCategories.splice(result.source.index, 1);
    tmpCategories.splice(result.destination.index, 0, movedCategory);

    setLocalCategories(tmpCategories);
    props.reorderBookmarkCategories(tmpCategories);
  };

  if (props.contentType === ContentType.category) {
    return (
      <Fragment>
        <div className={classes.Message}>
          {isCustomOrder ? (
            <p>You can drag and drop single rows to reorder categories</p>
          ) : (
            <p>
              Custom order is disabled. You can change it in{" "}
              <Link to="/settings/other">settings</Link>
            </p>
          )}
        </div>
        <DragDropContext onDragEnd={dragEndHandler}>
          <Droppable droppableId="categories">
            {(provided) => (
              <Table headers={["Name", "Actions"]} innerRef={provided.innerRef}>
                {localCategories.map(
                  (category: Category, index): JSX.Element => {
                    return (
                      <Draggable
                        key={category.id}
                        draggableId={category.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => {
                          const style = {
                            border: snapshot.isDragging
                              ? "1px solid var(--color-accent)"
                              : "none",
                            borderRadius: "4px",
                            ...provided.draggableProps.style,
                          };

                          return (
                            <tr
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              style={style}
                            >
                              <td>{category.name}</td>
                              {!snapshot.isDragging && (
                                <td className={classes.TableActions}>
                                  <div
                                    className={classes.TableAction}
                                    onClick={() =>
                                      deleteCategoryHandler(category)
                                    }
                                    onKeyDown={(e) =>
                                      keyboardActionHandler(
                                        e,
                                        category,
                                        deleteCategoryHandler
                                      )
                                    }
                                    tabIndex={0}
                                  >
                                    <Icon icon="mdiDelete" />
                                  </div>
                                  <div
                                    className={classes.TableAction}
                                    onClick={() =>
                                      props.updateHandler(category)
                                    }
                                    tabIndex={0}
                                  >
                                    <Icon icon="mdiPencil" />
                                  </div>
                                  <div
                                    className={classes.TableAction}
                                    onClick={() => props.pinBookmarkCategory(category)}
                                    onKeyDown={(e) =>
                                      keyboardActionHandler(
                                        e,
                                        category,
                                        props.pinBookmarkCategory
                                      )
                                    }
                                    tabIndex={0}
                                  >
                                    {category.isPinned ? (
                                      <Icon
                                        icon="mdiPinOff"
                                        color="var(--color-accent)"
                                      />
                                    ) : (
                                      <Icon icon="mdiPin" />
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        }}
                      </Draggable>
                    );
                  }
                )}
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      </Fragment>
    );
  } else {
    const bookmarks: { bookmark: Bookmark; categoryName: string }[] = [];
    props.categories.forEach((category: Category) => {
      category.bookmarks.forEach((bookmark: Bookmark) => {
        bookmarks.push({
          bookmark,
          categoryName: category.name,
        });
      });
    });

    return (
      <Table headers={["Name", "URL", "Icon", "Category", "Actions"]}>
        {bookmarks.map(
          (bookmark: { bookmark: Bookmark; categoryName: string }) => {
            return (
              <tr key={bookmark.bookmark.id}>
                <td>{bookmark.bookmark.name}</td>
                <td>{bookmark.bookmark.url}</td>
                <td>{bookmark.bookmark.icon}</td>
                <td>{bookmark.categoryName}</td>
                <td className={classes.TableActions}>
                  <div
                    className={classes.TableAction}
                    onClick={() => deleteBookmarkHandler(bookmark.bookmark)}
                    tabIndex={0}
                  >
                    <Icon icon="mdiDelete" />
                  </div>
                  <div
                    className={classes.TableAction}
                    onClick={() => props.updateHandler(bookmark.bookmark)}
                    tabIndex={0}
                  >
                    <Icon icon="mdiPencil" />
                  </div>
                </td>
              </tr>
            );
          }
        )}
      </Table>
    );
  }
};

const actions = {
  pinBookmarkCategory,
  deleteBookmarkCategory,
  deleteBookmark,
  createNotification,
  reorderBookmarkCategories,
};

export default connect(null, actions)(BookmarkTable);
