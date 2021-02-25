import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveyUserRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import { resolve } from 'path';
import SendMailService from "../services/SendMailService";

class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveyRepository = getCustomRepository(SurveysRepository);
        const surveyUserRepository = getCustomRepository(SurveyUserRepository);

        const user = await usersRepository.findOne({email});

        if(!user){
            return response.status(400).json({
                error: "User does not exist!"
            });
        }

        const survey = await surveyRepository.findOne({id: survey_id});

        if(!survey){
            return response.status(400).json({
                error: "Survey does not exist!"
            });
        }

        const surveyUserAlreadyExists = await surveyUserRepository.findOne({
            where: [{user_id: user.id}, {survey_id: survey.id}],
            relations: ["user", "survey"]
        });

        if(surveyUserAlreadyExists){
            return response.status(400).json(surveyUserAlreadyExists);
        }

        // Salva a informção da pesquisa x usuario
        const surveyUser = surveyUserRepository.create({
            user_id: user.id,
            survey_id
        })

        await surveyUserRepository.save(surveyUser);

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
       
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            user_id: user.id,
            link: process.env.URL_MAIL
        }

        // Envia email
        await SendMailService.execute(email, survey.title, variables, npsPath)

        return response.json(surveyUser);

    }

}

export { SendMailController }