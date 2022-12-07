function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

function Err(code, message) {
  const error = new Error(message);
  error.code = code
  return error;
}

module.exports = {
  getOffset,
  emptyOrRows,
  Err,
};
