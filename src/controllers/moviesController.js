const path = require("path");
const db = require("../database/models");
//const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");
const { createError, getUrl, getUrlBase } = require("../helpers");
const { userInfo } = require("os");

//Aqui tienen otra forma de llamar a cada uno de los modelos

const moviesController = {
  list:async (req, res) => {
   const {limit, order,offset} = req.query;
   let fields = ["title","ranking","release_date", "length","awards"];
   
   
    try {
    if(order && !fields.includes(order)){
      throw createError(400,
        `solo se puede ordenar pr ${fields.join(",")}`
        );
    }
      let total = await db.Movie.count()
    
    let movies=await db.Movie.findAll({
     attributes : {
           excludes: ['created_at','update_at']
       },
  include: [
          {
    associate : 'genre',
    attributes : {
        excludes: ['created_at','update_at']

},
    },
    {
      association :"actor",
      attributes:{
        exclude:["created_at","dated_at"],
      },
    },
],
limit: limit ? +limit : 5,
offset: offset ? +offset : 0,
order:[order ? order : "id"],
      
  });
  
  movies.forEach((movie) => {
    movie.setDataValue("link",`${getUrl(req)}/${movie.id}`);
    
  });
  return  res.status(200).json({
           ok : true,
         meta :{
        status: 200
      //  items :genres.length,
  //  total,
},

    data :{ 
    items :movies.length,
    total,
    genres,
    },
  });
   } catch (error) {
    console.log(error)
    return res.status(error.status || 500 ).json({
        ok : false,
        status:error.status || 500,
        msg :error.message
    });
   }
},
  //getById// 14-10

  getById:async (req, res) => {
    
    const {id}=req.params;

    try {
    if (isNaN(id)){
      throw createError(400,"el ID debe ser un numero");
    }
    
      const movies =  db.Movie.findByPk(req.params.id,{
        include:[
          {
            associate : 'genre',
            attributes : {
                excludes: ['created_at','update_at', "genres_id"]
                  
          },
        },
          {
            associate : 'actors',
    attributes : {
        excludes: ['created_at','update_at']

          },
        },
        ],
        attributes: {
          exclude: ["created_at", "updated_at", "genre_id"],
        },

      });
      if (!movie) {
        throw createError(400, "No existe una película con ese ID");
      }
    
      movie.release_date=moment(movie.release_date).format(
        "DD-MM-YYYY"

      );
    return res.status(200).json({
      ok:true,
      meta:{
        status: 200,
      },
      data:{
        movie,
      },
    });
    
      
      } catch (error) {
      console.log(error)
    return res.status(error.status).json({
        ok : false,
       status:error.status || 500,
        msg :error.message,
    });
  }
},
    
   /* db.Movie.findByPk(req.params.id, {
      include: ["genre"],
    }).then((movie) => {
      res.render("moviesDetail.ejs", { movie });
    });
  },*/

  ///////////////////////////
  newest: async (req, res) => {
    const {limit}= req.query;
    const options = {
      include: [
        {
          association:"genre",
          attributes:{
            exclude:["created_at","update_at"],
          },
        },
        {
          association: "actors",
          attributes:{
            exclude:[
              "created_at","updated_at"

            ],
        },
      },
        
      ],
      attributes:{
        exclude: ["created_at","updated_at"],

      },
      limit: limit ? +limit : 5,
      order: [["release_date", "DESC"]],
    };
    try {
      const movies = await db.Movie.findAll(options);
      const moviesModify = Movies.map((movie) =>{
        return {
          ...movie.dataValues,
          link: `${getUrlBase(req)}/${movied.id}`,

        };
      });
      return res.status(200).json({
        ok: true,
        meta:{
          status:200,
        },
        data:{
          movies: moviesModify,
        },
      });

    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        msg: error.message,
    });

    }
    
    /*db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      res.render("newestMovies", { movies });
    });*/
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      include: ["genre"],
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      res.render("recommendedMovies.ejs", { movies });
    });
  },
  //Aqui dispongo las rutas para trabajar con el CRUD
 

  create : async (req, res) =>{
   
   const {title,rating,awards,release_date,length,genre_id}= req.body;
   try {
    const movie = await db.Movie.create({

      title:req.body.title,//title ?.trim(),
      rating: req.body.rating,
      awards: req.body.awards,
      release_date: req.body.release_date,
      length: req.body.length,
      genre_id: req.body.genre_id,
    });
    return res.status(201).json({
      ok: true,
      meta: {
          status: 201,
      },
      data: {
          movie,
      },
  });

} catch (error) {
    console.log(error);
    const showErrors = error.error.map((error) =>{
      return {
        path:error.path,
        message: error.message,
      };
    });
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      errors: showErrors,
  });
   }
   },
  
   update: async (req,res) => {
    const{title, rating,awards,release_date,length,genre_id}= req.body;
    try {
        let movieId = req.params.id;
    let movie = await db.Movie.update(
        {
            title: title?.trim(),
            rating: rating,
            awards: awards,
            release_date: release_date,
            length: length,
            genre_id: genre_id
        },
        {
            where: {id: movieId}
        })
        return res.status(201).json({
            ok :true,
            meta :{
                status: 200
            },
            msg:'Pelicula actualizada con exito'
        }); 
    } catch (error) {
        return res.status(error.status || 500).json({
            ok:false,
            status : error.status || 500,
            msg:showErrors
        });
    }
},
destroy: async (req,res) =>{
    try {
        let movieId = req.params.id;

        

       await db.Movie.destroy({
        where: {
            id: movieId
        },
        force: true
    })
    return res.status(201).json({
        ok :true,
        meta :{
            status: 201
        },
        msg:'pelicula eliminada con existo'
    });  
    } catch (error) {
        console.log(error)
        return res.status(error.status || 500).json({
            ok:false,
            status : error.status || 500,
            message : error.message || 'upss, error'
        });
    }
    
}
}

module.exports = moviesController;  