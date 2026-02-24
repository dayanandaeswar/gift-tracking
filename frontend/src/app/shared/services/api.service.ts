import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FunctionEvent, Person, FunctionReport, PersonReport } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Functions
    getFunctions() { return this.http.get<FunctionEvent[]>(`${this.base}/functions`); }
    getFunction(id: number) { return this.http.get<FunctionEvent>(`${this.base}/functions/${id}`); }
    createFunction(data: any) { return this.http.post<FunctionEvent>(`${this.base}/functions`, data); }
    updateFunction(id: number, data: any) { return this.http.put<FunctionEvent>(`${this.base}/functions/${id}`, data); }
    deleteFunction(id: number) { return this.http.delete(`${this.base}/functions/${id}`); }

    // Persons
    getPersons() { return this.http.get<Person[]>(`${this.base}/persons`); }
    getPerson(id: number) { return this.http.get<Person>(`${this.base}/persons/${id}`); }
    createPerson(data: any) { return this.http.post<Person>(`${this.base}/persons`, data); }
    updatePerson(id: number, data: any) { return this.http.put<Person>(`${this.base}/persons/${id}`, data); }
    deletePerson(id: number) { return this.http.delete(`${this.base}/persons/${id}`); }

    // Gifts Received
    createGiftReceived(data: any) { return this.http.post(`${this.base}/gifts-received`, data); }
    updateGiftReceived(id: number, data: any) { return this.http.put(`${this.base}/gifts-received/${id}`, data); }
    deleteGiftReceived(id: number) { return this.http.delete(`${this.base}/gifts-received/${id}`); }

    // Gifts Given
    createGiftGiven(data: any) { return this.http.post(`${this.base}/gifts-given`, data); }
    updateGiftGiven(id: number, data: any) { return this.http.put(`${this.base}/gifts-given/${id}`, data); }
    deleteGiftGiven(id: number) { return this.http.delete(`${this.base}/gifts-given/${id}`); }

    // Reports
    getFunctionReport(id: number) { return this.http.get<FunctionReport>(`${this.base}/reports/function/${id}`); }
    getPersonReport(id: number) { return this.http.get<PersonReport>(`${this.base}/reports/person/${id}`); }
    getAllPersonsReport() { return this.http.get<PersonReport[]>(`${this.base}/reports/persons`); }
}
