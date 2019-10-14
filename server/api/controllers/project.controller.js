const { Project } = require('../models');
const sendErr = require('../utils/sendErr');

const create = async (req, res) => {
  try {
    const project = req.body;
    const exist = await Project.find({project_name: project.project_name});
    if (exist.length !== 0){
      return res.status(500).json({
        message: "Project already exists!",
        exist
      });
    };
    const createdProject = await Project.create(project);
    return res.status(200).json({
      message: "project created!",
      createdProject
    })
  }catch (err){
    return sendErr(res, err);
  }
};


// if you add functions above, add it here too
module.exports = {
  create
};
