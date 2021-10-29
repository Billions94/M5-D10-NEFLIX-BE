//   **********************        CODE BY EJIROGHENE     ***********************     //

import express from "express";
import * as db from  "../lib/db.js"
import uniqid from "uniqid"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import { getPDFReadableStream } from "../lib/pdfTools.js"
import { pipeline } from "stream"


const mediaRouter = express.Router()

// CLOUD STORAGE
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary, // CREDENTIALS, 
    params: {
      folder: "alex-blogs",
    },
  })

// POST PDF 

mediaRouter.get("/:id/downloadPDF", async(req, res, next) => {
    try {
      const data = await db.getMedia()
      const singleMedia = data.find(m => m.id === req.params.id)
  
      if(!singleMedia){
        res
        .status(404)
        .send({ message: `media with ${req.params.id} is not found!` });
      } else {
        res.setHeader("Content-Disposition", `attachment; filename=${singleMedia.id}.pdf`)
  
        const source = await getPDFReadableStream(singleMedia) 
        const destination = res
    
        pipeline(source, destination, err => {
          if (err) next(err)
        })
      }
    } catch (error) {
      next(error)
    }
  })
///              MEDIA SECTION

mediaRouter.post('/', async (req, res, next) => {
    try {
       
       const newMedia = {
        id: uniqid(),
           ...req.body,
           reviews: [],
           createdAt: new Date()
       }
       const medias = await db.getMedia()
       medias.push(newMedia)
       await db.writeMedia(medias)

       res.status(201).send(newMedia)
    } catch (error) {
       next(error) 
    }
})

mediaRouter.post('/:id/poster', multer({ storage: cloudinaryStorage }).single("poster"), async (req, res, next) => {
    try {
       

       const medias = await db.getMedia()

       const media = medias.find(m => m.id === req.params.id)
       media.Poster = req.file.path

       const mediaArray = medias.filter(m => m.id !== req.params.id)
       mediaArray.push(media)

       await db.writeMedia(mediaArray)

       res.send("Image uploaded on Cloudinary");
    } catch (error) {
       next(error) 
    }
})

mediaRouter.get('/', async (req, res, next) => {
    try {
    const medias = await db.getMedia()
    if (req.query && req.query.title) {
        const filteredMedias = medias.filter(
          (media) => media.title === req.query.title
        );
        res.send(filteredMedias);
      } else {
        res.status(200).send(medias)
      }
    } catch (error) {
        next(error)
    }
})

mediaRouter.get('/:id', async (req, res, next) => {
    try {
        const medias = await db.getMedia()
        const media = medias.find(m => m.id === req.params.id)
        res.send(media)
    } catch (error) {
        next(error)
    }
})

mediaRouter.put('/:id', async (req, res, next) => {
    try {
        const medias = await db.getMedia()
        const index = medias.findIndex(m => m.id === req.params.id)

        const updatedMedia = {
            ...medias[index],
            ...req.body,
            updatedAt: new Date()
        }

        medias[index] = updatedMedia
        await db.writeMedia(medias)

        res.status(203).send(updatedMedia)

    } catch (error) {
        next(error)
    }
})

mediaRouter.delete('/:id', async (req, res, next) => {
    try {
        const medias = await db.getMedia()

        const mediasLeft = medias.filter(m => m.id !== req.params.id)

        await db.writeMedia(mediasLeft)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

///              REVIEW SECTION

mediaRouter.post('/:id/reviews', async(req, res, next) => {
try {
    const { comment, rate } = req.body;

    const review = { id: uniqid(), comment, rate, elementId: req.params.id, createdAt: new Date() }

    const medias = await db.getMedia()
    const index = medias.findIndex(m => m.id === req.params.id)

    // blogs[index].comments = blogs[index].comments || [];

    const newReview = medias[index];

    newReview.reviews.push(review)

    medias[index] = newReview

    await db.writeMedia(medias)
    res.send(newReview)

} catch (error) {
    next(error)
}
})

mediaRouter.delete("/:mediaId/reviews/:reviewId", async(req, res, next) => {
    try {
      const medias = await db.getMedia()
      // FINDING A MEDIA BY ID
      const singleMedia = medias.find(p => p.id === req.params.mediaId)
        // GETTING THE INDEX OF THE MEDIA ID WE WANT TO DELETE
      const index = medias.findIndex(p => p.id === req.params.mediaId)
      // FILTERING BY ID AND RETURNING THE REVIEWS LEFT
      const review = singleMedia.reviews.filter(r => r.id !== req.params.reviewId)
      // ASSIGNING BLOG POST COMMENT ARRAY THE REVIEWS LEFT AFTER DELETING THE COMMENT
      singleMedia.reviews = review
      console.log(review)
      // ASSINGING THE INDEX OF THE REVIEW WE NEED TO DELETE
      medias[index] = singleMedia
      // WRITING BACK TO THE MEDIA ARRAY(DISK) TO SAVE THE UPDATED INFO
      await db.writeMedia(medias)
      res.status(204).send()
      console.log("Review Deleted ---->", review);
  
    } catch (error) {
      console.log(error)
      next(error)
    }
  })

export default mediaRouter

//   **********************        CODE BY EJIROGHENE     ***********************     //