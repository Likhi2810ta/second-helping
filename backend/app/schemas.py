"""Request bodies. These mirror the Zod schemas in frontend/src/lib/validators.ts
and the check constraints in the database, so bad input is stopped at every layer."""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Category = Literal["cooked", "bakery", "fruits_veg", "packed", "other"]
Diet = Literal["veg", "non_veg", "both"]
OrgType = Literal["restaurant", "hostel", "event", "caterer", "ngo", "shelter", "individual"]

DONOR_ORG_TYPES = {"restaurant", "hostel", "event", "caterer"}
RECEIVER_ORG_TYPES = {"ngo", "shelter", "individual"}

Text = Annotated[str, StringConstraints(strip_whitespace=True)]


class Body(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Location(Body):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)

    def ewkt(self) -> str:
        return f"SRID=4326;POINT({self.lng} {self.lat})"


class OrganizationCreate(Location):
    name: Annotated[Text, StringConstraints(min_length=3, max_length=120)]
    type: OrgType
    address: Annotated[Text, StringConstraints(min_length=5, max_length=300)]
    doc_path: Annotated[Text, StringConstraints(min_length=3, max_length=300)]


class ListingCreate(Location):
    title: Annotated[Text, StringConstraints(min_length=3, max_length=80)]
    description: Annotated[Text, StringConstraints(max_length=500)] | None = None
    category: Category
    diet: Diet
    portions: int = Field(ge=1, le=1000)
    hours_valid: float = Field(ge=0.5, le=24)
    address: Annotated[Text, StringConstraints(min_length=5, max_length=300)]
    pickup_note: Annotated[Text, StringConstraints(max_length=200)] | None = None
    photo_path: Annotated[Text, StringConstraints(max_length=300)] | None = None


class PickupRequestCreate(Body):
    message: Annotated[Text, StringConstraints(max_length=300)] | None = None
    eta_minutes: int | None = Field(default=None, ge=0, le=600)


class CompleteRequest(Body):
    rating: int | None = Field(default=None, ge=1, le=5)


class VerifyOrganization(Body):
    status: Literal["verified", "rejected"]
    reason: Annotated[Text, StringConstraints(max_length=300)] | None = None


class Subscribe(Body):
    email: Annotated[
        Text,
        StringConstraints(to_lower=True, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$"),
    ]
