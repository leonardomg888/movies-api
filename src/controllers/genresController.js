const db = require('../database/models');
//const sequelize = db.sequelize;
const {Op}= require('sequelize')
const {createError}=require('../helpers');

//const genresController = {
 module.exports={   
    list :async (req, res) => {
        let { limit,order= "id"}= req.query
        let fields=['name','ranking'];
        
        
        try {
     if(!fields.includes(order)){
        throw createError(
            400,
            "Sólo se puede ordenar por 'name' o 'ranking'"
        );
//ERROR solo se ordena por name o reting
     };

       let total =await db.Genre.count()
        let genres = await db.Genre.findAll({
            attributes : {
                
                exclude : ['created_at','updated_at']
            },
            limit : limit ? +limit :5,
            order:[order]
        });
     
        return  res.status(200).json({
       
            ok : true,
           meta :{
                  status: 200
              //  items :genres.length,
          //  total,
                  },
            data :{ 
                items :genres.length,
                total,
                genres,
                },
      });
      
    } catch (error) {
        console.log(error)
        return res.status(error.status).json({
            ok : false,
            msg :error.message
        })
       }
          //  db.Genre.findAll()
        //    .then(genres => {
                
          //  });
    },

///detalle/////getById
    detail: async (req, res) => {
      const {id}= req.params;
      
        try {
            if(!isNaN(id)){
   
   throw createError(400,"el id debe ser un numero");
            }   
    /*let  error =  new Error('el ID debe ser un numero!!');
    error.status = 400;
    throw error*/
     let genre = await db.Genre.findByPk(id); 
           if(!genre){throw createError(400,"no existe un genero con ese ID");
/*let  error =  new Error('no exixte un genrero con ese ID');
error.status = 404;
throw error*/
           }
               return req.status(200).json({
                ok:true,
                meta : {
                    //items : 1
                    status : 200
                },
                data : {genre,
                total : 1
                }
            });
      } catch (error) {
            console.log(error)
            return res.status(error.status || 500 ).json({
                ok : false,
                msg :error.message,
            });
        }

        
          //  .then(genre => {
          //      res.render('genresDetail.ejs', {genre});
        //    });
    },

    ///////////////////-----------------////////////////
getByName: async(req,res) =>{

    const {name}=req.params;
    
    try {
        if(!name){
        throw createError(400,'el nombre es obligatorio');
            /*let  error =  new Error('el nombre es obligatorio');
            error.status = 400;
        throw error*/
    }
let genre = await db.Genre.findOne({
    where : {
        name :{
            [Op.substring]:name,
        },
    },
});
if(!genre){
    throw createError(400,'no se encuentra nombre');
    /*let  error =  new Error('no de encuentra nombre');
    error.status = 404;
    throw error*/
             
               }
               return req.status(200).json({
                ok:true,
                meta : {
                    //items : 1
                    status : 200
                },
                data : {genre,
                total : 1
                },
            });
      
        } catch (error) {
        
            console.log(error)
            return res.status(error.status || 500 ).json({
                ok : false,
                msg :error.message,
            });
    
        }

    },
 };


//module.exports = genresController;