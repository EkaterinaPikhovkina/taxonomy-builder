from typing import Optional

from pydantic import BaseModel


class AddSubConceptRequest(BaseModel):
    concept_name: str
    parent_concept_uri: str


class AddTopConceptRequest(BaseModel):
    concept_name: str


class DeleteConceptRequest(BaseModel):
    concept_uri: str


class LiteralData(BaseModel):
    value: str
    lang: Optional[str] = None


class ConceptLiteralRequest(BaseModel):
    concept_uri: str
    literal: LiteralData


class ConceptLiteralUpdateRequest(BaseModel):
    concept_uri: str
    old_literal: LiteralData
    new_literal: LiteralData
