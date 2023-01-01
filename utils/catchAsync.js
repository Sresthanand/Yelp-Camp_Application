module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next); //executes Func , if error it passes on to next
  };
};
