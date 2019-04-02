module.exports = function getUsername (email) {
  let answer;
  const splitted = email.split('@');
  const first = splitted[0];

  if (first.length > 12) {
    answer = first.slice(0, 12);
  } else {
    answer = first;
  }

  return answer;
};
